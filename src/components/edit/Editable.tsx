"use client";

/* Admin2's editable texts (lib/editing). Each shows exactly what the page
   shows; a double-click opens it for typing, with the bar at the foot of the
   screen (EditBar) offering Save and Cancel (and bold, italic and links for
   longer texts). Save writes to the same entry the admin edits.

   While a box is open React leaves it alone (it is opened by hand, not by a
   re-render); afterwards it is drawn afresh (its key), from what was saved,
   or from what it was, on Cancel. */

import { useRouter } from "next/navigation";
import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { lexicalFromHtml } from "@/lib/lexicalFromHtml";
import { editStore } from "./editStore";
import { photosInText, sendingInText, type InTextPhotos } from "./PhotosInText";

export type Target = { collection: string; id: number | string; field: string; label: string };

async function save(target: Target, body: { value?: string; rich?: unknown }) {
  const res = await fetch("/next/edit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ collection: target.collection, id: target.id, field: target.field, ...body }),
  });
  const out = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
  if (!res.ok) throw new Error(out.error ?? `Not saved (${res.status})`);
  return out.status === "draft" ? "Saved as a draft: publish it in /admin" : "Saved";
}

function useBox(
  target: Target,
  mode: "text" | "long" | "rich",
  read: (el: HTMLElement) => { value?: string; rich?: unknown } | null,
  // anything more while it is open (a note's photos in its text: PhotosInText); what it returns undoes it
  onOpen?: (el: HTMLElement) => () => void,
) {
  const ref = useRef<HTMLElement>(null);
  const [version, setVersion] = useState(0);
  const router = useRouter();

  const close = (el: HTMLElement) => {
    el.contentEditable = "false";
    el.classList.remove("edit-open");
    editStore.close();
  };

  const open = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || el.isContentEditable) return;
    // another box open: closed if nothing was changed in it; if something
    // was, it is shown, to be saved or cancelled first
    const other = editStore.get().open;
    if (other) {
      if (other.changed()) {
        other.show();
        editStore.flash(`Save or cancel “${other.label}” first`);
        return;
      }
      other.cancel();
    }
    e.preventDefault();
    e.stopPropagation();
    // an empty box (its placeholder showing): emptied to be typed into
    const wasEmpty = el.classList.contains("edit-empty");
    if (wasEmpty) {
      el.classList.remove("edit-empty");
      el.textContent = "";
    }
    let before = el.innerHTML;
    el.contentEditable = mode === "rich" ? "true" : "plaintext-only";
    if (!el.isContentEditable) el.contentEditable = "true";
    el.classList.add("edit-open");
    el.focus();

    const cancel = () => {
      close(el);
      if (wasEmpty || el.innerHTML !== before) setVersion((v) => v + 1);
    };
    const commit = async () => {
      if (el.innerHTML === before) return cancel();
      const body = read(el);
      if (!body) return;
      editStore.busy(true);
      try {
        const said = await save(target, body);
        // what was saved stays as it is on the page; the page's fresh copy
        // (refresh, below) redraws the box only when it brings a change
        if (typeof body.value === "string") el.textContent = body.value || " ";
        close(el);
        editStore.flash(said);
        router.refresh();
      } catch (err) {
        editStore.busy(false);
        editStore.flash(err instanceof Error ? err.message : "Not saved");
      }
    };
    const keys = (k: KeyboardEvent) => {
      if (k.key === "Escape") {
        k.preventDefault();
        cancel();
      } else if ((k.key === "Enter" && (mode === "text" || k.ctrlKey || k.metaKey)) || (k.key === "s" && (k.ctrlKey || k.metaKey))) {
        k.preventDefault();
        void commit();
      }
    };
    // left without a change (a click elsewhere): closed again, so no box
    // stays open out of sight
    const leave = (f: FocusEvent) => {
      if (f.relatedTarget instanceof Node && el.contains(f.relatedTarget)) return;
      // (to one of the note's photos beside, to drag it into the text: PhotosInText)
      if (f.relatedTarget instanceof Element && f.relatedTarget.closest(".intext-source")) return;
      if (el.innerHTML === before) cancel();
    };
    el.addEventListener("keydown", keys);
    el.addEventListener("focusout", leave);
    const undo = onOpen?.(el);
    before = el.innerHTML; // (as set up for editing: only what is done after counts as a change)
    editStore.open({
      label: target.label,
      rich: mode === "rich",
      long: mode !== "text",
      save: commit,
      cancel,
      admin: `/admin/collections/${target.collection}/${target.id}`,
      changed: () => el.innerHTML !== before,
      show: () => {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.focus({ preventScroll: true });
      },
      done: () => {
        el.removeEventListener("keydown", keys);
        el.removeEventListener("focusout", leave);
        undo?.();
      },
    });
  };

  return { ref, version, open };
}

/** A short fingerprint of a text: a new one redraws its box. */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** A line of text: a title, a name, a street. `long`: several lines (a box
    of the admin's that keeps its line breaks; Enter starts a new line, Ctrl+
    Enter saves). `required`: can't be saved empty. `placeholder`: shown,
    faintly, while it is empty, so something can be added there. */
export function EditText({
  target,
  value,
  as: Tag = "span",
  className,
  style,
  long = false,
  required = false,
  placeholder,
  lang,
}: {
  target: Target;
  value: string;
  as?: "span" | "h1" | "h2" | "h4" | "h5" | "div" | "p";
  className?: string;
  style?: CSSProperties;
  long?: boolean;
  required?: boolean;
  placeholder?: string;
  lang?: string;
}) {
  const { ref, version, open } = useBox(target, long ? "long" : "text", (el) => {
    const value = long ? (el.innerText ?? "").replace(/\n{3,}/g, "\n\n").trim() : (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!value && required) {
      editStore.flash("This can't be left empty");
      return null;
    }
    return { value };
  });
  const empty = !value;
  return (
    <Tag
      key={`${version}:${value}`}
      ref={ref as never}
      className={`${className ?? ""} edit-box${long ? " edit-long" : ""}${empty ? " edit-empty" : ""}`.trim()}
      style={style}
      lang={lang}
      data-placeholder={placeholder}
      title={`Double-click to change: ${target.label}`}
      onDoubleClick={open}
    >
      {value || " "}
    </Tag>
  );
}

/** A longer text: an introduction, a field note. */
export function EditRich({
  target,
  html,
  blocks,
  className,
  photos,
}: {
  target: Target;
  html: string;
  blocks: unknown[];
  className?: string;
  /** a field note's text: its photos can be moved, sized and added (the tags a new one is given) */
  photos?: InTextPhotos;
}) {
  const { ref, version, open } = useBox(
    target,
    "rich",
    (el) => {
      if (sendingInText(el)) {
        editStore.flash("A photo is still being added: save in a moment");
        return null;
      }
      return { rich: lexicalFromHtml(el, blocks) };
    },
    photos ? (el) => photosInText(el, photos) : undefined,
  );
  return (
    <div
      key={`${version}:${hash(html)}`}
      ref={ref as never}
      className={`${className ?? ""} edit-box edit-rich`.trim()}
      title={`Double-click to change: ${target.label}`}
      onDoubleClick={open}
      dangerouslySetInnerHTML={{ __html: html || "<p></p>" }}
    />
  );
}
