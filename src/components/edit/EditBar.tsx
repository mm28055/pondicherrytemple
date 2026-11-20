"use client";

/* Admin2's bar, at the foot of the screen while editing the site (lib/editing).
   Resting: what to do, and the way out. With a text open: its name, bold,
   italic and link for longer texts, Cancel and Save. A text left open warns
   before the page is left. */

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PhotoArranger } from "./PhotoArranger";
import { editStore } from "./editStore";

const keepFocus = (e: React.MouseEvent) => e.preventDefault();

function link() {
  const url = window.prompt("Link to (a web address, or a page here such as /field-notes/…). Leave empty to remove the link.");
  if (url === null) return;
  if (url.trim()) document.execCommand("createLink", false, url.trim());
  else document.execCommand("unlink");
}

export function EditBar() {
  const { open, busy, message, photos, arranging } = useSyncExternalStore(editStore.subscribe, editStore.get, editStore.get);
  const [dropping, setDropping] = useState(false);

  // Admin2 is on: the photo viewer shows its boxes too (PhotoDetails)
  useEffect(() => {
    editStore.setEditing(true);
    return () => editStore.setEditing(false);
  }, []);

  // photos dragged from the computer onto a page that has photographs: a
  // sign over the page; dropped, the photos panel opens and adds them
  useEffect(() => {
    if (!photos || arranging) return;
    let depth = 0;
    const files = (e: DragEvent) => Boolean(e.dataTransfer?.types.includes("Files"));
    const enter = (e: DragEvent) => {
      if (!files(e) || editStore.get().open) return; // (a text open: photos go into the text, PhotosInText)
      depth++;
      setDropping(true);
    };
    const leave = (e: DragEvent) => {
      if (!files(e)) return;
      if (--depth <= 0) setDropping(false);
    };
    const over = (e: DragEvent) => {
      if (files(e)) e.preventDefault();
    };
    const drop = (e: DragEvent) => {
      if (!files(e)) return;
      e.preventDefault();
      depth = 0;
      setDropping(false);
      const list = [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"));
      if (list.length && !editStore.get().open) editStore.arrange(list);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
      setDropping(false);
    };
  }, [photos, arranging]);

  useEffect(() => {
    if (!open) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [open]);

  // An editable text in a link (a festival's name in Ritual Cycles) or a
  // link in an editable text: a click waits a moment before following the
  // link, so a double-click can open the text instead; inside a text that
  // is open, a click only places the cursor. (Ctrl- or Cmd-click: a new tab, as ever.)
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const box = target?.closest<HTMLElement>(".edit-box");
      const a = target?.closest<HTMLAnchorElement>("a[href]");
      if (!box || !a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(timer);
      if (box.isContentEditable || e.detail > 1) return;
      const href = a.href;
      timer = setTimeout(() => {
        if (editStore.get().open) return;
        const url = new URL(href);
        if (url.origin === location.origin) router.push(url.pathname + url.search + url.hash);
        else window.open(href, a.target || "_self");
      }, 320);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  return (
    <>
    <div className="edit-bar" role="toolbar" aria-label="Admin2">
      {open ? (
        <>
          {/* what is open; a click brings it into view */}
          <button type="button" className="edit-bar-label" onMouseDown={keepFocus} onClick={() => open.show()} title="Show the text being edited">
            Editing: {open.label}
          </button>
          {open.rich && (
            <span className="edit-bar-group">
              <button type="button" onMouseDown={keepFocus} onClick={() => document.execCommand("bold")} title="Bold (Ctrl+B)">
                <b>B</b>
              </button>
              <button type="button" onMouseDown={keepFocus} onClick={() => document.execCommand("italic")} title="Italic (Ctrl+I)">
                <i>I</i>
              </button>
              <button type="button" onMouseDown={keepFocus} onClick={link} title="Link">
                Link
              </button>
            </span>
          )}
          <span className="edit-bar-group">
            <button type="button" onMouseDown={keepFocus} onClick={() => open.cancel()} disabled={busy} title="Cancel (Esc)">
              Cancel
            </button>
            <button
              type="button"
              className="edit-bar-save"
              onMouseDown={keepFocus}
              onClick={() => void open.save()}
              disabled={busy}
              title={open.long ? "Save (Ctrl+Enter)" : "Save (Enter)"}
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </span>
        </>
      ) : (
        <>
          <span className="edit-bar-label">Admin2</span>
          <span className="edit-bar-hint">Double-click any outlined text to change it</span>
          {photos && (
            <button type="button" className="edit-bar-photos" onClick={() => editStore.arrange()} title={`Arrange or add the photos of ${photos.label}`}>
              Photos
            </button>
          )}
          <a href="/admin">/admin</a>
          <a href="/admin2/exit">Leave</a>
        </>
      )}
      {/* "Saved", or what is in the way: just above the bar, at every width */}
      {message && <span className="edit-bar-say">{message}</span>}
    </div>
    {/* outside the bar (which is shifted to the centre), over the whole page */}
    {dropping && photos && <div className="edit-drop">Drop to add these photos to {photos.label}</div>}
    {arranging && photos && <PhotoArranger area={photos} files={arranging.files} />}
    </>
  );
}
