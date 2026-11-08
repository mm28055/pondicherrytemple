"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { NoteRowData } from "@/lib/view";
import { hasTerm, nearestWords, searchForm, searchTerms, slips, slipsFor, startsWord } from "@/lib/searchWords";
import { NoteRow } from "./Rows";
import { WritingsTabs } from "./WritingsTabs";

/** A note in the list, with what its filters go by. */
export type BrowsedNote = NoteRowData & {
  temples: string[];
  observances: string[];
  /** words it can be found by that the row doesn't show: the temples' other names, the festivals' names */
  also: string;
};

/** One way of narrowing: `also`, other names a choice can be found by. */
export type NoteFilter = {
  key: string;
  label: string;
  options: { id: string; label: string; also?: string }[];
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const KEYS = ["temple", "festival", "month", "type"] as const;
type Key = (typeof KEYS)[number];
const tamilMonthOf = (r: NoteRowData) => r.local?.split(" ")[0];

/** Whether a note is under a choice. */
const isUnder = (r: BrowsedNote, key: Key, id: string) => {
  if (key === "temple") return r.temples.includes(id);
  if (key === "festival") return r.observances.includes(id);
  if (key === "type") return r.kind === id;
  return id.startsWith("ta:") ? tamilMonthOf(r) === id.slice(3) : r.date.slice(0, 7) === id;
};

type Suggestion =
  | { type: "words"; label: string; query?: string }
  | { type: "choice"; key: Key; id: string; label: string; count: number; close?: boolean }
  | { type: "note"; href: string; label: string; date: string; quote?: Quote };

/** A few words from a note's text round a word searched for. */
type Quote = { before: string; word: string; after: string };

/** The first place in a text where a word starts or ends with one of the
    spellings searched for (as hasTerm finds them), with some words either side. */
function quoteFrom(text: string, spellings: string[]): Quote | null {
  for (const m of text.matchAll(/[\p{L}\p{M}\p{N}]+/gu)) {
    const w = searchForm(m[0]).trim();
    if (!spellings.some((s) => w.startsWith(s) || (s.length > 3 && w.endsWith(s)))) continue;
    const at = m.index ?? 0;
    let from = Math.max(0, at - 40);
    let to = Math.min(text.length, at + m[0].length + 60);
    if (from > 0) from = text.indexOf(" ", from) + 1 || from;
    if (to < text.length) to = text.lastIndexOf(" ", to) > at + m[0].length ? text.lastIndexOf(" ", to) : to;
    return {
      before: (from > 0 ? "…" : "") + text.slice(from, at),
      word: m[0],
      after: text.slice(at + m[0].length, to) + (to < text.length ? "…" : ""),
    };
  }
  return null;
}

/** The Field Notes page's header, list and search. The search sits on the tabs'
    line. Pressed, it offers the temples, festivals and months to choose from;
    typing narrows these to what fits and adds the notes with those words in
    their titles; Enter searches every note's whole words for what is typed,
    in their spellings (lib/searchWords). A word no note has is taken for the
    nearest that some do (a slip or two, by its length), the list says so, and
    the suggestions offer that spelling and match names and titles near it. While searching, the introduction and
    the photographs make way, so the results are just under the tabs. The
    notes' words are fetched only once someone goes to search, and the address
    keeps the search (?q=…&temple=…), so it can be sent to someone. */
export function FieldNotesBrowser({
  rows,
  filters,
  intro,
  strip,
}: {
  rows: BrowsedNote[];
  filters: NoteFilter[];
  intro: ReactNode;
  strip: ReactNode;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Partial<Record<Key, string>>>({});
  const [oldestFirst, setOldestFirst] = useState(false);
  const [texts, setTexts] = useState<Record<string, string> | null>(null);
  const [panel, setPanel] = useState(false); // the suggestions
  const [line, setLine] = useState(false); // on a phone, the box open on the tabs' line
  const [active, setActive] = useState(-1);
  const fetched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const words = useDeferredValue(query);

  const fetchTexts = useCallback(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/field-notes/text")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setTexts)
      .catch(() => {
        fetched.current = false; // tried again at the next search
      });
  }, []);

  // what the address asks for, on arriving; then the address follows the search
  const read = useRef(false);
  useEffect(() => {
    const at = new URLSearchParams(window.location.search);
    const q = at.get("q") ?? "";
    const asked = Object.fromEntries(KEYS.filter((k) => at.get(k)).map((k) => [k, at.get(k)!]));
    setQuery(q);
    setChosen(asked);
    if (q) fetchTexts();
    if (q || Object.keys(asked).length) setLine(true);
    read.current = true;
  }, [fetchTexts]);
  useEffect(() => {
    if (!read.current) return;
    const at = new URLSearchParams();
    if (query.trim()) at.set("q", query.trim());
    for (const k of KEYS) if (chosen[k]) at.set(k, chosen[k]!);
    const s = at.toString();
    window.history.replaceState(window.history.state, "", s ? `?${s}` : window.location.pathname);
  }, [query, chosen]);

  // a press elsewhere closes the suggestions, as Escape does
  useEffect(() => {
    if (!panel) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setPanel(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [panel]);

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
        // a spelling takes in a near one three times as many notes use, as Vinayagar does Vinayaka
        const near = nearestWords(t, vocab);
        if (has) {
          const max = slipsFor(t.length);
          const also = [...vocab]
            .filter(([w, n]) => n >= Math.max(5, has * 3) && w !== t && slips(t, w, max) <= max)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([w]) => w);
          return { t, as: [t, ...also], fixed: false, also };
        }
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
  const asRead = useMemo(() => readTerms(words), [readTerms, words]);
  const meant = putRight(asRead);
  const alsoWith = asRead.flatMap((r) => r.also.map((w) => written.get(w) ?? w));

  const shown = useMemo(() => {
    const out = rows.filter((r) => {
      for (const k of KEYS) if (chosen[k] && !isUnder(r, k, chosen[k]!)) return false;
      const text = hay.get(r.id) ?? "";
      return asRead.every((t) => t.as.some((a) => hasTerm(text, a)));
    });
    return oldestFirst ? out.reverse() : out;
  }, [rows, hay, asRead, chosen, oldestFirst]);

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
    const out: { head?: string; items: Suggestion[] }[] = [];
    const fixed = putRight(read);
    if (terms.length) {
      const items: Suggestion[] = [{ type: "words", label: `Search all notes for “${query.trim()}”` }];
      if (fixed) items.unshift({ type: "words", label: `Did you mean “${fixed}”?`, query: fixed });
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
      const notes = [...rows.filter((r) => exact(r.title)), ...rows.filter((r) => !exact(r.title) && near(r.title))]
        .slice(0, 5)
        .map((r) => ({ type: "note" as const, href: r.href, label: r.title, date: `${r.day} ${r.shortMonth}` }));
      if (notes.length) out.push({ head: "Field notes", items: notes });
      // then notes with the words in their text, a few words shown where they are
      const titled = new Set(notes.map((n) => n.href));
      const spellings = read.flatMap((r) => r.as);
      const inText = rows.filter((r) => !titled.has(r.href) && read.every((x) => x.as.some((a) => hasTerm(hay.get(r.id) ?? "", a))));
      const quoted = inText.flatMap((r) => {
        const quote = quoteFrom(texts?.[r.id] ?? r.longExcerpt ?? "", spellings);
        return quote ? [{ type: "note" as const, href: r.href, label: r.title, date: `${r.day} ${r.shortMonth}`, quote }] : [];
      });
      if (quoted.length) out.push({ head: `In the text · ${inText.length} ${inText.length === 1 ? "note" : "notes"}`, items: quoted.slice(0, 5) });
    }
    return out;
  }, [query, filters, chosen, rows, readTerms, putRight, hay, texts]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => setActive(-1), [query]);

  const pick = (s: Suggestion) => {
    setPanel(false);
    if (s.type === "note") return router.push(s.href);
    if (s.type === "words" && s.query) setQuery(s.query);
    if (s.type === "choice") {
      setChosen((c) => ({ ...c, [s.key]: s.id }));
      setQuery("");
    }
    input.current?.blur();
    window.scrollTo({ top: 0 });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setPanel(false);
    if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) pick(flat[active]);
      else pick({ type: "words", label: "" });
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    setPanel(true);
    const step = e.key === "ArrowDown" ? 1 : -1;
    setActive((a) => {
      const next = a + step;
      return next < -1 ? flat.length - 1 : next >= flat.length ? -1 : next;
    });
  };

  const searching = Boolean(words.trim()) || KEYS.some((k) => chosen[k]);
  const clear = () => {
    setQuery("");
    setChosen({});
    setPanel(false);
    setLine(false);
  };
  const nameOf = (k: Key) => filters.find((f) => f.key === k)?.options.find((o) => o.id === chosen[k])?.label;

  // Each note's words run down to "Read more →" at the foot of its picture,
  // ending on a whole line: row by row, the lines that fit are counted and the
  // line spacing eased (by a pixel or so) so the last one ends just above it.
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      for (const p of list.current?.querySelectorAll<HTMLElement>(".row-excerpt.fill") ?? []) {
        p.style.height = "";
        p.style.lineHeight = "";
        const cell = p.parentElement!;
        if (getComputedStyle(cell).containerType !== "size") continue; // stacked, on small screens
        const more = cell.querySelector<HTMLElement>(".row-more");
        const line = parseFloat(getComputedStyle(p).lineHeight) || 27;
        const room = cell.getBoundingClientRect().bottom - p.getBoundingClientRect().top - (more?.offsetHeight ?? 0);
        if (p.scrollHeight <= room) continue; // all of it fits
        const lines = Math.max(1, Math.round(room / line));
        p.style.lineHeight = `${room / lines}px`;
        p.style.height = `${room}px`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [shown]);

  const glass = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
  let index = -1;

  return (
    <>
      <header className="page-head landing-head tight-head">
        <div className="kicker">From the temples</div>
        <h1 className="page-title">Writings</h1>
        <WritingsTabs current="field-notes" searching={line}>
          <div className={`notes-search${line ? " open" : ""}${query ? " filled" : ""}`} ref={box}>
            <button
              type="button"
              className="notes-search-go"
              aria-label="Search the field notes"
              onClick={() => {
                flushSync(() => {
                  setLine(true);
                  setPanel(true);
                });
                input.current?.focus();
              }}
            >
              {glass}
            </button>
            {glass}
            <input
              ref={input}
              type="text"
              enterKeyHint="search"
              autoComplete="off"
              role="combobox"
              aria-expanded={panel}
              aria-controls="notes-suggest"
              aria-activedescendant={active >= 0 ? `notes-suggest-${active}` : undefined}
              aria-label="Search the field notes"
              placeholder="Search field notes"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPanel(true);
              }}
              onFocus={() => {
                fetchTexts();
                setPanel(true);
              }}
              onKeyDown={onKey}
            />
            {(query || line) && (
              <button type="button" className="notes-search-x" aria-label="Clear the search" onClick={clear}>
                ×
              </button>
            )}
            {panel && flat.length > 0 && (
              <ul className="notes-suggest" id="notes-suggest" role="listbox" aria-label="Suggestions">
                {groups.map((g, n) => (
                  <li key={g.head ?? n} role="presentation">
                    {g.head && <div className="notes-suggest-head">{g.head}</div>}
                    <ul role="presentation" style={{ listStyle: "none" }}>
                      {g.items.map((s) => {
                        index += 1;
                        const at = index;
                        return (
                          <li
                            key={s.type === "note" ? s.href : s.type === "choice" ? `${s.key}${s.id}` : "words"}
                            id={`notes-suggest-${at}`}
                            role="option"
                            aria-selected={active === at}
                            className={active === at ? "notes-suggest-item on" : "notes-suggest-item"}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pick(s)}
                          >
                            <span>
                              {s.label}
                              {s.type === "note" && s.quote && (
                                <small className="notes-suggest-quote">
                                  {s.quote.before}
                                  <b>{s.quote.word}</b>
                                  {s.quote.after}
                                </small>
                              )}
                            </span>
                            {s.type === "choice" && <span>{s.count}</span>}
                            {s.type === "note" && <span>{s.date}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </WritingsTabs>
        {!searching && intro}
      </header>
      {!searching && strip}
      <section className="section" style={{ paddingTop: 12 }}>
        {searching && (
          <p className="notes-count" aria-live="polite">
            {shown.length} of {rows.length} field notes
            {meant && <span className="notes-meant"> with “{meant}”, as none has “{words.trim()}”</span>}
            {!meant && alsoWith.length > 0 && <span className="notes-meant"> with “{words.trim()}” or “{alsoWith.join("”, “")}”</span>}
            {KEYS.filter((k) => chosen[k]).map((k) => (
              <button key={k} type="button" aria-label={`Show all, not only ${nameOf(k)}`} onClick={() => setChosen((c) => ({ ...c, [k]: undefined }))}>
                {nameOf(k)} ×
              </button>
            ))}
            <button type="button" onClick={clear}>
              Clear all
            </button>
            <button type="button" className="notes-order" onClick={() => setOldestFirst(!oldestFirst)}>
              {oldestFirst ? "Oldest first" : "Newest first"} ⇅
            </button>
          </p>
        )}
        <div ref={list}>
          {shown.map((r) => (
            <NoteRow key={r.id} row={r} withPicture />
          ))}
        </div>
        {!shown.length && <p className="empty">No field notes match this search.</p>}
      </section>
    </>
  );
}
