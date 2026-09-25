/* Text written in the admin's editor, turned into what the pages show.

   toHTML — the finished text. Links to other pages on the site point at
   their web addresses; photos, videos and recordings placed in the text are
   shown with their captions (and left out if the person in them has not
   agreed). Text is escaped by the converter, so what is stored can't inject
   anything into the page.

   openingText / plainText — the words alone, for excerpts and descriptions. */

import {
  convertLexicalToHTML,
  LinkHTMLConverter,
  type HTMLConverter,
  type HTMLConvertersFunction,
} from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

/** Editor content as stored. */
export type RichText = { root: { children: unknown[] } } | null | undefined;

type MediaDoc = {
  url?: string | null;
  alt?: string | null;
  caption?: string | null;
  credit?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  consent?: string | null;
  sizes?: { large?: { url?: string | null; width?: number | null; height?: number | null } };
};

type UploadNode = { type: "upload"; value: unknown; fields?: { caption?: string | null } };

/** How to find a linked page: temples need their region, so the caller says. */
export type LinkPaths = { temple: (id: number) => string | null };

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const upload: HTMLConverter<UploadNode> = ({ node }) => {
  const doc = node.value as MediaDoc | null;
  if (!doc || typeof doc !== "object" || !doc.url || doc.consent === "withhold") return "";
  const caption = node.fields?.caption || doc.caption || "";
  const credit = doc.credit || "";
  const figcaption =
    caption || credit
      ? `<figcaption>${escape(caption)}${caption && credit ? " · " : ""}${
          credit ? `<span class="credit">${escape(credit)}</span>` : ""
        }</figcaption>`
      : "";
  const mime = doc.mimeType ?? "";
  const url = escape(doc.url);

  if (mime.startsWith("image/")) {
    const large = doc.sizes?.large;
    const src = escape(large?.url ?? doc.url);
    const width = large?.width ?? doc.width;
    const height = large?.height ?? doc.height;
    const size = width && height ? ` width="${width}" height="${height}"` : "";
    return `<figure class="rich-media"><img src="${src}" alt="${escape(doc.alt ?? "")}"${size} loading="lazy">${figcaption}</figure>`;
  }
  if (mime.startsWith("video/")) {
    return `<figure class="rich-media"><video controls preload="metadata" src="${url}"></video>${figcaption}</figure>`;
  }
  if (mime.startsWith("audio/")) {
    return `<figure class="rich-media"><audio controls preload="metadata" src="${url}"></audio>${figcaption}</figure>`;
  }
  return `<p><a href="${url}">${escape(caption || doc.filename || "Download")}</a></p>`;
};

function hrefFor(relationTo: string, value: unknown, paths: LinkPaths): string {
  const doc = value && typeof value === "object" ? (value as { id?: number; slug?: string | null }) : null;
  if (!doc?.slug) return "#";
  switch (relationTo) {
    case "field-notes":
      return `/field-notes/${doc.slug}`;
    case "articles":
      return `/articles/${doc.slug}`;
    case "observances":
      return `/festivals-and-rituals/${doc.slug}`;
    case "temples":
      return (doc.id !== undefined && paths.temple(doc.id)) || "#";
    default:
      return "#";
  }
}

export function toHTML(data: RichText, paths: LinkPaths): string {
  if (!data?.root?.children?.length) return "";
  const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkHTMLConverter({
      internalDocToHref: ({ linkNode }) =>
        hrefFor(linkNode.fields.doc?.relationTo ?? "", linkNode.fields.doc?.value, paths),
    }),
    upload,
  });
  return markScripts(
    convertLexicalToHTML({
      data: data as unknown as SerializedEditorState,
      converters,
      disableContainer: true,
      disableIndent: true,
      disableTextAlign: true,
    })
  );
}

/** Tamil and Sanskrit words typed in the editor get their script's font:
    runs of those letters are wrapped in <span lang="…">. Only the text
    between tags is touched, never the tags or their attributes. */
/** Plain text (e.g. a one-line quotation) → safe HTML, with Tamil and
    Sanskrit words in their script's font. */
export function plainWithScripts(text: string): string {
  return markScripts(escape(text));
}

function markScripts(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((part) =>
      part.startsWith("<")
        ? part
        : part
            .replace(/[஀-௿]+(?:[\s‌‍]+[஀-௿]+)*/g, (m) => `<span lang="ta">${m}</span>`)
            .replace(/[ऀ-ॿ]+(?:[\s‌‍]+[ऀ-ॿ]+)*/g, (m) => `<span lang="sa">${m}</span>`)
    )
    .join("");
}

type Node = { type?: string; text?: string; children?: Node[] };

const textOf = (n: Node): string =>
  n.type === "text"
    ? n.text ?? ""
    : n.type === "linebreak"
      ? " "
      : (n.children ?? []).map(textOf).join("");

const blocksOf = (data: RichText) => (data?.root?.children ?? []) as Node[];

/** The first paragraph's words — the opening of a note, for lists. */
export function openingText(data: RichText): string {
  for (const n of blocksOf(data)) {
    if (n.type !== "paragraph") continue;
    const text = textOf(n).trim();
    if (text) return text;
  }
  return "";
}

/** All the words, one line — for page descriptions. */
export function plainText(data: RichText): string {
  return blocksOf(data)
    .map((n) => textOf(n).trim())
    .filter(Boolean)
    .join(" ");
}
