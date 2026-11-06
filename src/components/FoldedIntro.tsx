"use client";

import { flushSync } from "react-dom";
import { useState, type MouseEvent } from "react";
import { Html } from "./Prose";

const SHOWN_WORDS = 250;
/** folded only if it would keep back at least this many words */
const WORTH_FOLDING = 50;

const TOKEN = /<[^>]+>|[^<]+/g;
const VOID = /^<(?:br|hr|img|source|wbr)\b|\/>$/i;
const BLOCK_END = /^<\/(?:p|li|h[1-6]|blockquote)\b/i;
const SENTENCE_END = /[.?!]["'”’)]*(?=\s|$)/;
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);

/** Where to stop reading: at the first sentence's end after about `SHOWN_WORDS`
    words, or its paragraph's end if that comes sooner; and the tags still open
    there, to be closed before the words and opened again after them. Null for
    a text too short to be worth folding. */
function foldAt(html: string) {
  if (words(html.replace(/<[^>]*>/g, " ")).length < SHOWN_WORDS + WORTH_FOLDING) return null;
  const open: string[] = [];
  let count = 0;
  for (const match of html.matchAll(TOKEN)) {
    const token = match[0];
    if (token.startsWith("</")) {
      if (count >= SHOWN_WORDS && BLOCK_END.test(token)) return { at: match.index, open: [...open] };
      open.pop();
    } else if (token.startsWith("<")) {
      if (!VOID.test(token)) open.push(token);
    } else {
      const here = words(token).length;
      if (count + here >= SHOWN_WORDS) {
        // past the word it needs, the first full stop that ends a sentence
        const need = Math.max(0, SHOWN_WORDS - count);
        const from = token.trimStart().split(/\s+/).slice(0, need).join(" ").length;
        const end = SENTENCE_END.exec(token.slice(from));
        if (end) return { at: match.index + from + end.index + end[0].length, open: [...open] };
      }
      count += here;
    }
  }
  return null;
}

/** The words that open it, at the end of the text's last line. */
const MORE = '<button type="button" class="intro-more" aria-expanded="false">Read more →</button>';
const closing = (tags: string[]) => [...tags].reverse().map((t) => `</${/^<(\w+)/.exec(t)![1]}>`).join("");

/** A temple's introduction: about its first 250 words, to the end of a
    sentence, then "Read more →"; pressed, the whole of it, and it stays open.
    All of it is in the page from the start; a short introduction shows whole. */
export function FoldedIntro({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  const fold = foldAt(html);
  if (open || !fold) return <Html className="prose" html={html} />;

  // the words are in the text, so the tap is heard here. The rest opens below
  // and the page stays exactly where it is: left to itself, the browser would
  // hold on to what is under the text, and carry the reader down with it
  const read = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".intro-more")) return;
    const page = document.documentElement;
    const y = window.scrollY;
    page.style.overflowAnchor = "none";
    flushSync(() => setOpen(true));
    window.scrollTo({ top: y, behavior: "instant" });
    requestAnimationFrame(() => requestAnimationFrame(() => (page.style.overflowAnchor = "")));
  };

  return (
    <div onClick={read}>
      <Html className="prose" html={`${html.slice(0, fold.at)} ${MORE}${closing(fold.open)}`} />
      <div hidden>
        <Html className="prose" html={`${fold.open.join("")}${html.slice(fold.at)}`} />
      </div>
    </div>
  );
}
