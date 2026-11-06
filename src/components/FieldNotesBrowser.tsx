"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { NoteRowData } from "@/lib/view";
import { hasTerm, searchForm, searchTerms, startsWord } from "@/lib/searchWords";
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
  | { type: "words"; label: string }
  | { type: "choice"; key: Key; id: string; label: string; count: number }
  | { type: "note"; href: string; label: string; date: string };

/** The Field Notes page's header, list and search. The search sits on the tabs'
    line. Pressed, it offers the temples, festivals and months to choose from;
    typing narrows these to what fits and adds the notes with those words in
    their titles; Enter searches every note's whole words for what is typed,
    in their spellings (lib/searchWords). While searching, the introduction and
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

  const shown = useMemo(() => {
    const terms = searchTerms(words);
    const out = rows.filter((r) => {
      for (const k of KEYS) if (chosen[k] && !isUnder(r, k, chosen[k]!)) return false;
      const text = hay.get(r.id) ?? "";
      return terms.every((t) => hasTerm(text, t));
    });
    return oldestFirst ? out.reverse() : out;
  }, [rows, hay, words, chosen, oldestFirst]);

  // the suggestions, in groups: the words themselves first, then the choices that fit, then notes by their titles
  const groups = useMemo(() => {
    const terms = searchTerms(query);
    const fits = (text: string) => {
      const t = ` ${searchForm(text)} `;
      return terms.every((w) => startsWord(t, w));
    };
    const out: { head?: string; items: Suggestion[] }[] = [];
    if (terms.length) out.push({ items: [{ type: "words", label: `Search all notes for “${query.trim()}”` }] });
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
          return [{ type: "choice" as const, key, id: o.id, label, count: rows.filter((r) => isUnder(r, key, o.id)).length }];
        });
      if (key !== "month") items.sort((a, b) => a.label.localeCompare(b.label));
      if (items.length) out.push({ head: f.label, items: terms.length ? items.slice(0, 5) : items });
    }
    if (terms.length) {
      const notes = rows
        .filter((r) => fits(r.title))
        .slice(0, 5)
        .map((r) => ({ type: "note" as const, href: r.href, label: r.title, date: `${r.day} ${r.shortMonth}` }));
      if (notes.length) out.push({ head: "Field notes", items: notes });
    }
    return out;
  }, [query, filters, chosen, rows]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  useEffect(() => setActive(-1), [query]);

  const pick = (s: Suggestion) => {
    setPanel(false);
    if (s.type === "note") return router.push(s.href);
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
                            <span>{s.label}</span>
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
