"use client";

import { useCallback, useMemo } from "react";
import type { NoteRowData } from "@/lib/view";
import { hasTerm, nearestWords, searchForm, searchTerms, slips, slipsFor, startsWord, stemOf } from "@/lib/searchWords";
import { WRITINGS_TA } from "@/content/writingsTa";

/** A note in the list, with what its filters go by. */
export type BrowsedNote = NoteRowData & {
  temples: string[];
  observances: string[];
  /** words it can be found by that the row doesn't show: the temples' other names, the festivals' names */
  also: string;
  /** its Tamil month by its English name, on the Tamil page */
  tamilMonth?: string;
};

/** One way of narrowing: `also`, other names a choice can be found by. */
export type NoteFilter = {
  key: string;
  label: string;
  options: { id: string; label: string; also?: string }[];
};

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const KEYS = ["temple", "festival", "month", "type"] as const;
export type Key = (typeof KEYS)[number];
const tamilMonthOf = (r: BrowsedNote) => r.tamilMonth ?? r.local?.split(" ")[0];

/** Whether a note is under a choice. */
export const isUnder = (r: BrowsedNote, key: Key, id: string) => {
  if (key === "temple") return r.temples.includes(id);
  if (key === "festival") return r.observances.includes(id);
  if (key === "type") return r.kind === id;
  return id.startsWith("ta:") ? tamilMonthOf(r) === id.slice(3) : r.date.slice(0, 7) === id;
};

/** A few words from a note's text round a word searched for. */
export type Quote = { before: string; word: string; after: string };

export type Suggestion =
  | { type: "words"; label: string; query?: string }
  | { type: "choice"; key: Key; id: string; label: string; count: number; close?: boolean }
  | { type: "note"; href: string; label: string; date: string; quote?: Quote }
  /** a place in the note open on the page: the `nth` word found there */
  | { type: "here"; nth: number; label: string; quote: Quote };

export type SuggestGroup = { head?: string; items: Suggestion[] };

/** Whether a word as written is one of the spellings searched for: it starts
    with one, or, if longer than three letters, ends with one (as hasTerm). */
export const isHit = (word: string, spellings: string[]) => {
  const w = searchForm(word).trim();
  return Boolean(w) && spellings.some((s) => w.startsWith(stemOf(s)) || (s.length > 3 && w.endsWith(s)));
};

/** Each place in a text where a word is one of the spellings, with some words
    either side (at most `most`). */
export function quotesFrom(text: string, spellings: string[], most = 1): Quote[] {
  const out: Quote[] = [];
  for (const m of text.matchAll(/[\p{L}\p{M}\p{N}]+/gu)) {
    if (!isHit(m[0], spellings)) continue;
    const at = m.index ?? 0;
    let from = Math.max(0, at - 40);
    let to = Math.min(text.length, at + m[0].length + 60);
    if (from > 0) from = text.indexOf(" ", from) + 1 || from;
    if (to < text.length) to = text.lastIndexOf(" ", to) > at + m[0].length ? text.lastIndexOf(" ", to) : to;
    out.push({
      before: (from > 0 ? "…" : "") + text.slice(from, at),
      word: m[0],
      after: text.slice(at + m[0].length, to) + (to < text.length ? "…" : ""),
    });
    if (out.length >= most) break;
  }
  return out;
}

/** A note's address, carrying what was searched, so that the note opens with
    those words marked and goes to the first (NoteHits): `q` as typed, and `w`
    the spellings it was read as, where they are not just what was typed. */
export function withSearch(href: string, typed: string, spellings: string[]) {
  const q = typed.trim();
  if (!q) return href;
  const at = new URLSearchParams({ q });
  const plain = searchTerms(q);
  if (spellings.length && spellings.join(" ") !== plain.join(" ")) at.set("w", spellings.join(" "));
  return `${href}?${at}`;
}

/** The search of the field notes, as on the Field Notes page and in the box on
    each note: every note's words in the form they are searched in, what is
    typed read as words to find (put right, when no note has one), and the
    suggestions for what is typed. */
export function useNoteSearch({
  rows,
  filters,
  texts,
  query,
  chosen = {},
  ta = false,
  except,
}: {
  rows: BrowsedNote[];
  filters: NoteFilter[];
  texts: Record<string, string> | null;
  query: string;
  chosen?: Partial<Record<Key, string>>;
  ta?: boolean;
  /** a note left out of the suggestions (the one open) */
  except?: string;
}) {
  const T = ta ? WRITINGS_TA : null;

  // each note's words, in the form they are searched in
  const hay = useMemo(() => {
    const out = new Map<string, string>();
    for (const r of rows) {
      const [y, m, d] = r.date.slice(0, 10).split("-").map(Number);
      const text = [r.title, r.where, r.also, r.kindLabel, r.local, `${d} ${MONTHS[m - 1]} ${y}`, r.shortMonth, texts?.[r.id] ?? r.longExcerpt];
      out.set(r.id, ` ${searchForm(text.join(" "))} `);
    }
    return out;
  }, [rows, texts]);

  // every word the notes and the choices have (in search form), with how many
  // notes have it, and a spelling of it as written, to show
  const { vocab, written } = useMemo(() => {
    const vocab = new Map<string, number>();
    const written = new Map<string, string>();
    for (const text of hay.values()) for (const w of new Set(text.split(" "))) if (w) vocab.set(w, (vocab.get(w) ?? 0) + 1);
    const raw = [
      ...rows.map((r) => [r.title, r.where, r.also, texts?.[r.id] ?? r.longExcerpt].join(" ")),
      ...filters.flatMap((f) => f.options.map((o) => `${o.label} ${o.also ?? ""}`)),
    ];
    for (const text of raw)
      for (const token of text.split(/[^\p{L}\p{M}\p{N}]+/u)) {
        const w = searchForm(token).trim();
        if (!w || w.includes(" ")) continue;
        if (!vocab.has(w)) vocab.set(w, 0);
        if (!written.has(w)) written.set(w, token);
      }
    return { vocab, written };
  }, [hay, rows, texts, filters]);

  /** What is typed, each word with the words it is searched as: itself, or,
      when no note has it, the nearest words that some do. */
  const readTerms = useCallback(
    (typed: string) =>
      searchTerms(typed).map((t) => {
        const has = [...hay.values()].filter((text) => hasTerm(text, t)).length;
        if (has) {
          // a spelling takes in another of the same word that three times as many
          // notes use, as Vinayagar does Vinayaka: a slip or two, no more, so
          // that Thiruvonam is not taken for Thiruvizha
          const max = Math.min(2, slipsFor(t.length) - 1);
          const also =
            max < 1
              ? []
              : [...vocab]
                  .filter(([w, n]) => n >= Math.max(5, has * 3) && w !== t && slips(t, w, max) <= max)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([w]) => w);
          return { t, as: [t, ...also], fixed: false, also };
        }
        const near = nearestWords(t, vocab);
        const as = near.length ? near : nearestWords(t, vocab, true);
        return { t, as: as.length ? as : [t], fixed: as.length > 0, also: [] as string[] };
      }),
    [hay, vocab],
  );
  /** The typed words with each one put right, as written; null if none needed it. */
  const putRight = useCallback(
    (read: ReturnType<typeof readTerms>) =>
      read.some((r) => r.fixed) ? read.map((r) => (r.fixed ? (written.get(r.as[0]) ?? r.as[0]) : r.t)).join(" ") : null,
    [written],
  );

  // the suggestions, in groups: the words themselves first, then the choices that fit, then notes by their titles
  const groups = useMemo(() => {
    const terms = searchTerms(query);
    const exact = (text: string) => {
      const t = ` ${searchForm(text)} `;
      return terms.every((w) => startsWord(t, w));
    };
    // near: each word typed, or a spelling it is read as (put right, or a far
    // commoner one), starts a word of the text
    const read = readTerms(query);
    const near = (text: string) => {
      const t = ` ${searchForm(text)} `;
      return read.every((r) => r.as.some((w) => startsWord(t, w)));
    };
    const fits = (text: string) => exact(text) || near(text);
    const out: SuggestGroup[] = [];
    const fixed = putRight(read);
    const spellings = read.flatMap((r) => r.as);
    if (terms.length) {
      const items: Suggestion[] = [{ type: "words", label: T?.searchAll(query.trim()) ?? `Search all notes for “${query.trim()}”` }];
      if (fixed) items.unshift({ type: "words", label: T?.didYouMean(fixed) ?? `Did you mean “${fixed}”?`, query: fixed });
      out.push({ items });
    }
    for (const f of filters) {
      const key = f.key as Key;
      if (key === "type") continue;
      // found by another of its names, that name is shown, so it is plain why it is here
      const items = f.options
        .filter((o) => o.id !== chosen[key])
        .flatMap((o) => {
          const other = fits(o.label) ? null : o.also?.split(", ").find(fits);
          if (!fits(o.label) && !other) return [];
          const label = other ? `${o.label} · ${other}` : o.label;
          const close = exact(o.label) || Boolean(o.also?.split(", ").some(exact));
          return [{ type: "choice" as const, key, id: o.id, label, count: rows.filter((r) => isUnder(r, key, o.id)).length, close }];
        });
      if (key !== "month") items.sort((a, b) => a.label.localeCompare(b.label));
      if (terms.length) items.sort((a, b) => Number(b.close) - Number(a.close)); // the exact before the near
      if (items.length) out.push({ head: f.label, items: terms.length ? items.slice(0, 5) : items });
    }
    if (terms.length) {
      const others = rows.filter((r) => r.id !== except);
      const notes = [...others.filter((r) => exact(r.title)), ...others.filter((r) => !exact(r.title) && near(r.title))]
        .slice(0, 5)
        .map((r) => ({ type: "note" as const, href: withSearch(r.href, query, spellings), label: r.title, date: `${r.day} ${r.shortMonth}` }));
      if (notes.length) out.push({ head: T?.notes ?? "Field notes", items: notes });
      // then notes with the words in their text, a few words shown where they are
      const titled = new Set(notes.map((n) => n.href));
      const inText = others.filter((r) => !titled.has(withSearch(r.href, query, spellings)) && read.every((x) => x.as.some((a) => hasTerm(hay.get(r.id) ?? "", a))));
      const quoted = inText.flatMap((r) => {
        const [quote] = quotesFrom(texts?.[r.id] ?? r.longExcerpt ?? "", spellings);
        return quote ? [{ type: "note" as const, href: withSearch(r.href, query, spellings), label: r.title, date: `${r.day} ${r.shortMonth}`, quote }] : [];
      });
      if (quoted.length) out.push({ head: T?.inText(inText.length) ?? `In the text · ${inText.length} ${inText.length === 1 ? "note" : "notes"}`, items: quoted.slice(0, 5) });
    }
    return out;
  }, [query, filters, chosen, rows, readTerms, putRight, hay, texts, T, except]);

  return { hay, written, readTerms, putRight, groups };
}
