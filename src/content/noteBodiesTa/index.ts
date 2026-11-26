/* The field notes in Tamil, by their web address, a file for each month. A line
   to a paragraph; "- " begins a line of a list. In the English note's own words
   and marks, by their number there: [words](2) its second link, {{3}} its third
   passage in Tamil or Sanskrit, {{3-6}} those one under another, {{p4}} its
   fourth paragraph as it stands. <br> and <strong> as they are. */

import { tamilOf } from "../../lib/tamilPages";
import { NOTES_2026_03 } from "./2026-03";
import { NOTES_2026_04 } from "./2026-04";
import { NOTES_2026_05 } from "./2026-05";
import { NOTES_2026_06 } from "./2026-06";
import { NOTES_2026_07 } from "./2026-07";
import { NOTES_2026_08 } from "./2026-08";
import { NOTES_2026_09 } from "./2026-09";
import { NOTES_2026_10 } from "./2026-10";
import { NOTES_2026_11 } from "./2026-11";

const NOTES: Record<string, string> = { ...NOTES_2026_03, ...NOTES_2026_04, ...NOTES_2026_05, ...NOTES_2026_06, ...NOTES_2026_07, ...NOTES_2026_08, ...NOTES_2026_09, ...NOTES_2026_10, ...NOTES_2026_11 };

/** Whether a note is in Tamil. */
export const noteInTamil = (id: string) => id in NOTES;

/** A note's text in Tamil, as the page shows it, its links and passages taken
    from the English one; null if it is not in Tamil yet. */
export function noteBodyTa(id: string, english: string): string | null {
  const text = NOTES[id];
  if (text === undefined) return null;
  const links = [...english.matchAll(/<a ([^>]*)>/g)].map((m) => m[1].replace(/href="([^"]*)"/, (_, h: string) => `href="${tamilOf(h) ?? h}"`));
  const passages = english.match(/<span lang="(?:ta|sa)">[\s\S]*?<\/span>/g) ?? [];
  const blocks = english.match(/<(p|ul|ol|blockquote|h2|h3|figure)\b[\s\S]*?<\/\1>/g) ?? [];
  const inline = (s: string) =>
    s
      .replace(/\[([^\]]+)\]\((\d+)\)/g, (whole, words: string, n: string) => (links[Number(n) - 1] ? `<a ${links[Number(n) - 1]}>${words}</a>` : whole))
      .replace(/\{\{(\d+)(?:-(\d+))?\}\}/g, (_, a: string, b?: string) => passages.slice(Number(a) - 1, Number(b ?? a)).join("<br>"));
  const out: string[] = [];
  let list: string[] = [];
  const endList = () => {
    if (list.length) out.push(`<ul class="list-bullet">${list.join("")}</ul>`);
    list = [];
  };
  for (const line of text.trim().split("\n").map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("- ")) {
      list.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    endList();
    const whole = /^\{\{p(\d+)\}\}$/.exec(line);
    out.push(whole ? (blocks[Number(whole[1]) - 1] ?? "") : `<p>${inline(line)}</p>`);
  }
  endList();
  return out.join("");
}

/** A note's words alone, for the lists and the search. */
export const noteWordsTa = (id: string): string | null =>
  NOTES[id] === undefined
    ? null
    : NOTES[id]
        .replace(/\{\{[^}]*\}\}/g, " ")
        .replace(/\[([^\]]+)\]\(\d+\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/^\s*- /gm, "")
        .replace(/\s+/g, " ")
        .trim();
