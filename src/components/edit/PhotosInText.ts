/* Admin2: the photos placed in a field note's text, while the text is open
   (components/edit/Editable, EditRich). Plain page code, no React: the box
   is being typed into by hand.
   - A click on a photo: a small menu on it — Column (the text's width), Half
     (beside the text, the words running round it), Remove (out of the
     text; it stays in the photo library).
   - A photo dragged to another place among the paragraphs: moved there.
   - Photos dropped from the computer: put in at that place (shown at once,
     sent to the photo library meanwhile, tagged with the note's temples and
     festivals), at the text's width.
   Saved with the text (lib/lexicalFromHtml reads data-size and
   data-new-photo). Decided 20 Nov 2026: column or half, no other sizes. */

import { slugify, uploadPhoto } from "@/lib/photoUpload";
import { editStore } from "./editStore";

export type InTextPhotos = { slug: string; tags: { temples?: number[]; observances?: number[] } };

export function photosInText(box: HTMLElement, photos: InTextPhotos): () => void {
  const isPhoto = (n: Element | null): n is HTMLElement =>
    n instanceof HTMLElement && n.parentElement === box && n.classList.contains("edit-kept") && Boolean(n.querySelector("figure"));
  const all = () => [...box.children].filter(isPhoto);
  for (const k of all()) k.draggable = true;

  // the menu, over the photo clicked
  const menu = document.createElement("div");
  menu.className = "intext-menu";
  menu.hidden = true;
  menu.innerHTML = `<button type="button" data-do="column">Column</button><button type="button" data-do="half">Half</button><button type="button" data-do="remove">Remove</button>`;
  document.body.append(menu);
  let current: HTMLElement | null = null;
  const sizeOf = (k: HTMLElement) => k.dataset.size ?? (k.querySelector("figure")?.classList.contains("size-half") ? "half" : "column");
  const place = () => {
    if (!current || !current.isConnected) return void (menu.hidden = true);
    const r = (current.querySelector("figure") ?? current).getBoundingClientRect();
    menu.style.top = `${Math.max(8, r.top + 8)}px`;
    menu.style.left = `${r.left + 8}px`;
    for (const b of menu.querySelectorAll<HTMLButtonElement>("button")) b.setAttribute("aria-pressed", String(b.dataset.do === sizeOf(current)));
  };
  const choose = (k: HTMLElement | null) => {
    for (const x of all()) x.classList.toggle("intext-chosen", x === k);
    current = k;
    menu.hidden = !k;
    place();
  };
  const onClick = (e: MouseEvent) => choose(isPhoto((e.target as Element).closest?.(".edit-kept") ?? null) ? ((e.target as Element).closest(".edit-kept") as HTMLElement) : null);
  menu.addEventListener("mousedown", (e) => e.preventDefault()); // (the text keeps the focus)
  menu.addEventListener("click", (e) => {
    const what = (e.target as HTMLElement).dataset.do;
    if (!current || !what) return;
    if (what === "remove") {
      current.remove();
      choose(null);
    } else {
      current.dataset.size = what;
      current.querySelector("figure")?.classList.toggle("size-half", what === "half");
      place();
    }
  });

  // dragging: a photo moved, or one of the note's photos from the column beside
  // (components/NotePhotos, marked data-photo-id), or photos from the computer
  // put in, before or after the paragraph under the pointer
  let dragged: HTMLElement | null = null;
  let fromColumn: { id: string; src: string } | null = null;
  const column = [...document.querySelectorAll<HTMLElement>("[data-photo-id]")].filter((x) => !box.contains(x));
  for (const c of column) {
    c.draggable = true;
    c.classList.add("intext-source");
  }
  const onColumnStart = (e: DragEvent) => {
    const c = (e.target as Element).closest?.<HTMLElement>("[data-photo-id]");
    if (!c || box.contains(c)) return;
    fromColumn = { id: c.dataset.photoId!, src: c.dataset.photoSrc ?? c.querySelector("img")?.src ?? "" };
    e.dataTransfer?.setData("text/plain", "");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
    choose(null);
  };
  const onColumnEnd = () => {
    fromColumn = null;
    unmark();
  };
  // what can be done, said once the text is open (after the bar has taken it)
  const hint = setTimeout(
    () =>
      editStore.flash(
        column.length
          ? "To place a photo in the text, drag it in from the photos beside, or from your computer"
          : "To place a photo in the text, drag it in from your computer",
      ),
    0,
  );
  let mark: { el: Element; after: boolean } | null = null;
  const unmark = () => {
    mark?.el.classList.remove("intext-before", "intext-after");
    mark = null;
  };
  // the paragraph (or photo) nearest the pointer, by its height on the screen
  // (not what is under it: a photo floated beside the words would be)
  const spotAt = (e: DragEvent) => {
    let best: { el: Element; after: boolean; d: number } | null = null;
    for (const el of box.children) {
      const r = el.getBoundingClientRect();
      if (!r.height) continue;
      const d = e.clientY < r.top ? r.top - e.clientY : e.clientY > r.bottom ? e.clientY - r.bottom : 0;
      if (!best || d < best.d) best = { el, after: e.clientY > r.top + r.height / 2, d };
      if (d === 0) break;
    }
    return best && { el: best.el, after: best.after };
  };
  const files = (e: DragEvent) => Boolean(e.dataTransfer?.types.includes("Files"));
  const onStart = (e: DragEvent) => {
    const k = (e.target as Element).closest?.(".edit-kept");
    if (!isPhoto(k)) return;
    dragged = k;
    e.dataTransfer?.setData("text/plain", "");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    choose(null);
  };
  const onOver = (e: DragEvent) => {
    if (!dragged && !fromColumn && !files(e)) return;
    e.preventDefault();
    e.stopPropagation();
    const spot = spotAt(e);
    unmark();
    if (spot && spot.el !== dragged) {
      mark = spot;
      spot.el.classList.add(spot.after ? "intext-after" : "intext-before");
    }
  };
  const onDrop = (e: DragEvent) => {
    if (!dragged && !fromColumn && !files(e)) return;
    e.preventDefault();
    e.stopPropagation();
    const spot = mark;
    unmark();
    const put = (n: Element) => {
      if (spot) spot.el.insertAdjacentElement(spot.after ? "afterend" : "beforebegin", n);
      else box.append(n);
    };
    if (dragged) {
      if (spot?.el !== dragged) put(dragged);
      dragged = null;
      return;
    }
    // one of the note's own photos, from the column: the same photo, placed (nothing sent)
    if (fromColumn) {
      const k = document.createElement("div");
      k.className = "edit-kept";
      k.contentEditable = "false";
      k.draggable = true;
      k.dataset.newPhoto = fromColumn.id;
      k.dataset.size = "column";
      k.innerHTML = `<figure class="rich-media"><img alt=""></figure>`;
      k.querySelector("img")!.src = fromColumn.src;
      put(k);
      fromColumn = null;
      return;
    }
    // photos from the computer: each shown at once, then sent
    let at: Element | null = null;
    for (const file of [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"))) {
      const k = document.createElement("div");
      k.className = "edit-kept intext-sending";
      k.contentEditable = "false";
      k.draggable = true;
      k.dataset.newPhoto = "";
      k.dataset.size = "column";
      k.innerHTML = `<figure class="rich-media"><img alt=""></figure>`;
      k.querySelector("img")!.src = URL.createObjectURL(file);
      if (at) at.insertAdjacentElement("afterend", k);
      else put(k);
      at = k;
      uploadPhoto(file, slugify(photos.slug), photos.tags)
        .then((id) => {
          k.dataset.newPhoto = String(id);
          k.classList.remove("intext-sending");
        })
        .catch((err) => {
          k.remove();
          editStore.flash(`${file.name} not added: ${err instanceof Error ? err.message : err}`);
        });
    }
  };
  const onEnd = () => {
    dragged = null;
    unmark();
  };

  box.addEventListener("click", onClick);
  box.addEventListener("dragstart", onStart);
  box.addEventListener("dragover", onOver);
  box.addEventListener("drop", onDrop);
  box.addEventListener("dragend", onEnd);
  document.addEventListener("dragstart", onColumnStart);
  document.addEventListener("dragend", onColumnEnd);
  window.addEventListener("scroll", place, { passive: true });
  window.addEventListener("resize", place);
  return () => {
    clearTimeout(hint);
    box.removeEventListener("click", onClick);
    box.removeEventListener("dragstart", onStart);
    box.removeEventListener("dragover", onOver);
    box.removeEventListener("drop", onDrop);
    box.removeEventListener("dragend", onEnd);
    document.removeEventListener("dragstart", onColumnStart);
    document.removeEventListener("dragend", onColumnEnd);
    for (const c of column) {
      c.draggable = false;
      c.classList.remove("intext-source");
    }
    window.removeEventListener("scroll", place);
    window.removeEventListener("resize", place);
    menu.remove();
    unmark();
    for (const k of all()) {
      k.draggable = false;
      k.classList.remove("intext-chosen");
    }
  };
}

/** Photos still being sent from a note's text (they would be left out of it if saved now). */
export const sendingInText = (box: HTMLElement) => box.querySelectorAll(".intext-sending").length;
