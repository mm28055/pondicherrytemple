/* Admin2: text edited on the page itself, turned back into what the admin's
   editor stores (Lexical). The page shows the stored text as HTML (lib/richtext,
   editHTML); after a double-click it can be typed into, and on Save this walks
   what is there now and rebuilds the stored form.

   Lossless where it matters: a photo, video or rule placed in the text is
   shown untouchable on the page and carries its index (data-keep), so the very
   node it came from goes back; a link carries its own settings (data-link), so
   a link to a temple or a note stays that link. Only the formats the admin's
   editors allow come back: bold, italic, underline, links, headings (h2, h3),
   lists and quotations. Anything else pasted in becomes plain words. */

type LNode = Record<string, unknown>;

const BOLD = 1;
const ITALIC = 2;
const UNDERLINE = 8;

const text = (t: string, format: number): LNode => ({
  type: "text",
  text: t,
  format,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
});

const element = (type: string, children: LNode[], extra: LNode = {}): LNode => ({
  type,
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  ...extra,
});

/** A photo placed in the text, as the admin's editor stores one. */
const uploadNode = (id: number, size: string): LNode => ({
  type: "upload",
  version: 3,
  format: "",
  id: [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, "0")).join(""),
  fields: { size },
  relationTo: "media",
  value: id,
});

const paragraph = (children: LNode[]) => element("paragraph", children, { textFormat: 0, textStyle: "" });

function formatOf(el: HTMLElement, format: number): number {
  const tag = el.tagName.toLowerCase();
  if (tag === "b" || tag === "strong") format |= BOLD;
  if (tag === "i" || tag === "em") format |= ITALIC;
  if (tag === "u") format |= UNDERLINE;
  const style = el.style;
  if (style) {
    if (style.textDecoration.includes("underline") || style.textDecorationLine?.includes("underline")) format |= UNDERLINE;
    if (style.fontStyle === "italic") format |= ITALIC;
    if (style.fontWeight === "bold" || Number(style.fontWeight) >= 600) format |= BOLD;
  }
  return format;
}

/** The words and links inside a paragraph, heading or list item. */
function inline(node: Node, format: number, out: LNode[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = (node.textContent ?? "").replace(/ /g, " ").replace(/[\r\n]+/g, " ");
    if (!t) return;
    const last = out[out.length - 1];
    if (last && last.type === "text" && last.format === format) last.text = String(last.text) + t;
    else out.push(text(t, format));
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (tag === "br") {
    out.push({ type: "linebreak", version: 1 });
    return;
  }
  if (tag === "a") {
    const children: LNode[] = [];
    el.childNodes.forEach((c) => inline(c, format, children));
    if (!children.length) return;
    let fields: LNode = { linkType: "custom", url: el.getAttribute("href") ?? "", newTab: false };
    try {
      if (el.dataset.link) fields = JSON.parse(el.dataset.link);
    } catch {
      // keep the plain link
    }
    out.push(element("link", children, { fields, version: 3 }));
    return;
  }
  // things that are not words: left out
  if (["img", "video", "audio", "figure", "script", "style", "svg"].includes(tag)) return;
  const f = formatOf(el, format);
  el.childNodes.forEach((c) => inline(c, f, out));
}

/** A block's words as they are (spaces kept, so a paragraph not touched
    comes back exactly as stored); an empty paragraph's line break (the
    browser's, to hold it open) left out. */
function trim(children: LNode[]): LNode[] {
  if (children.every((c) => c.type === "linebreak")) return [];
  return children.filter((c) => c.type !== "text" || c.text !== "");
}

const inlineOf = (el: Node) => {
  const out: LNode[] = [];
  el.childNodes.forEach((c) => inline(c, 0, out));
  return trim(out);
};

function list(el: HTMLElement): LNode {
  const numbered = el.tagName.toLowerCase() === "ol";
  const items: LNode[] = [];
  let value = 1;
  el.childNodes.forEach((c) => {
    if (c.nodeType !== Node.ELEMENT_NODE) return;
    const li = c as HTMLElement;
    const out: LNode[] = [];
    li.childNodes.forEach((n) => {
      // a list inside a list item: its words joined on (kept simple)
      inline(n, 0, out);
    });
    items.push(element("listitem", trim(out), { value: value++ }));
  });
  return element("list", items, {
    listType: numbered ? "number" : "bullet",
    start: 1,
    tag: numbered ? "ol" : "ul",
  });
}

/** The stored form of what the edited box holds now. `kept` is the stored
    text it was shown from: its photos and rules go back as they were. */
export function lexicalFromHtml(box: HTMLElement, kept: unknown[]): LNode {
  const blocks: LNode[] = [];
  let loose: LNode[] = [];
  const flush = () => {
    const t = trim(loose);
    if (t.length) blocks.push(paragraph(t));
    loose = [];
  };

  const BLOCKS = new Set(["p", "div", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "hr", "figure"]);
  const walk = (container: Node) => container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      inline(node, 0, loose);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (el.dataset.keep !== undefined) {
      flush();
      const original = kept[Number(el.dataset.keep)] as LNode | undefined;
      if (!original) return;
      if (original.type !== "upload") return void blocks.push(original);
      // a photo: its size as chosen in Admin2 (components/edit/PhotosInText), the photo by its number
      const value = original.value && typeof original.value === "object" ? (original.value as { id: number }).id : original.value;
      const fields = { ...((original.fields as LNode | null) ?? {}), ...(el.dataset.size ? { size: el.dataset.size } : {}) };
      blocks.push({ ...original, value, fields });
      return;
    }
    // a photo dropped into the text in Admin2, once it is in the photo library
    if (el.dataset.newPhoto !== undefined) {
      flush();
      const id = Number(el.dataset.newPhoto);
      if (id) blocks.push(uploadNode(id, el.dataset.size ?? "column"));
      return;
    }
    if (["b", "strong", "i", "em", "u", "a", "span", "br"].includes(tag)) {
      inline(el, 0, loose);
      return;
    }
    flush();
    // a paragraph holding a list, heading or quotation (as the browser makes
    // one when a line in it is made a list): its parts, each a block of its own
    if ((tag === "p" || tag === "div") && [...el.children].some((c) => BLOCKS.has(c.tagName.toLowerCase()))) {
      walk(el);
      flush();
      return;
    }
    if (tag === "ul" || tag === "ol") blocks.push(list(el));
    else if (/^h[1-6]$/.test(tag)) blocks.push(element("heading", inlineOf(el), { tag: tag === "h1" || tag === "h2" ? "h2" : "h3" }));
    else if (tag === "blockquote") blocks.push(element("quote", inlineOf(el)));
    else if (tag === "hr") blocks.push({ type: "horizontalrule", version: 1 });
    else if (["figure", "img", "video", "audio"].includes(tag)) return; // pasted pictures: not here (stage 2)
    else blocks.push(paragraph(inlineOf(el)));
  });
  walk(box);
  flush();

  // no empty paragraphs left at the end
  while (blocks.length) {
    const last = blocks[blocks.length - 1];
    if (last.type === "paragraph" && !(last.children as LNode[]).length) blocks.pop();
    else break;
  }
  return { root: element("root", blocks) };
}
