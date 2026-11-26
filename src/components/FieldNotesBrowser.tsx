"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { hasTerm } from "@/lib/searchWords";
import { HIDDEN_TA } from "@/content/hiddenTa";
import { WRITINGS_TA } from "@/content/writingsTa";
import { NoteRow } from "./Rows";
import { WritingsTabs } from "./WritingsTabs";
import { isUnder, KEYS, useNoteSearch, withSearch, type BrowsedNote, type Key, type NoteFilter, type Suggestion } from "./useNoteSearch";

export type { BrowsedNote, NoteFilter };

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
  ta = false,
}: {
  rows: BrowsedNote[];
  filters: NoteFilter[];
  intro: ReactNode;
  strip: ReactNode;
  /** in Tamil (content/writingsTa) */
  ta?: boolean;
}) {
  const T = ta ? WRITINGS_TA : null;
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
    fetch(ta ? "/ta/field-notes/text" : "/field-notes/text")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setTexts)
      .catch(() => {
        fetched.current = false; // tried again at the next search
      });
  }, [ta]);

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

  const { hay, written, readTerms, putRight, groups } = useNoteSearch({ rows, filters, texts, query, chosen, ta });
  const asRead = useMemo(() => readTerms(words), [readTerms, words]);
  const meant = putRight(asRead);
  const alsoWith = asRead.flatMap((r) => r.also.map((w) => written.get(w) ?? w));
  const spellings = asRead.flatMap((r) => r.as);

  const shown = useMemo(() => {
    const out = rows.filter((r) => {
      for (const k of KEYS) if (chosen[k] && !isUnder(r, k, chosen[k]!)) return false;
      const text = hay.get(r.id) ?? "";
      return asRead.every((t) => t.as.some((a) => hasTerm(text, a)));
    });
    return oldestFirst ? out.reverse() : out;
  }, [rows, hay, asRead, chosen, oldestFirst]);
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
  // the introduction and the photographs make way as soon as the box is pressed,
  // and come back as it is left, unless a search is showing
  const [focused, setFocused] = useState(false);
  const away = focused || searching;
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
      <header className={`page-head landing-head tight-head${away ? " head-searching" : ""}`}>
        <div className="kicker">{T?.kicker ?? "From the temples"}</div>
        <h1 className="page-title">{T?.title ?? "Writings"}</h1>
        <WritingsTabs current="field-notes" searching={line} ta={ta}>
          <div className={`notes-search${line ? " open" : ""}${query ? " filled" : ""}`} ref={box}>
            <button
              type="button"
              className="notes-search-go"
              aria-label={T?.search ?? "Search the field notes"}
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
              aria-label={T?.search ?? "Search the field notes"}
              placeholder={T?.search ?? "Search field notes"}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPanel(true);
              }}
              onBlur={() => setFocused(false)}
              onFocus={() => {
                setFocused(true);
                fetchTexts();
                setPanel(true);
              }}
              onKeyDown={onKey}
            />
            {(query || line) && (
              <button type="button" className="notes-search-x" aria-label={T?.clearSearch ?? "Clear the search"} onClick={clear}>
                ×
              </button>
            )}
            {panel && flat.length > 0 && (
              <ul className="notes-suggest" id="notes-suggest" role="listbox" aria-label={T?.suggestions ?? "Suggestions"}>
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
        <div className={away ? "slide-away gone" : "slide-away"} inert={away || undefined}>
          <div>{intro}</div>
        </div>
      </header>
      <div className={away ? "slide-away gone" : "slide-away"} inert={away || undefined}>
        <div>{strip}</div>
      </div>
      <section className="section" style={{ paddingTop: 12 }}>
        {searching && (
          <p className="notes-count" aria-live="polite">
            {T?.count(shown.length, rows.length) ?? `${shown.length} of ${rows.length} field notes`}
            {meant && <span className="notes-meant">{T?.meant(meant, words.trim()) ?? ` with “${meant}”, as none has “${words.trim()}”`}</span>}
            {!meant && alsoWith.length > 0 && <span className="notes-meant">{T?.also(words.trim(), alsoWith) ?? ` with “${words.trim()}” or “${alsoWith.join("”, “")}”`}</span>}
            {KEYS.filter((k) => chosen[k]).map((k) => (
              <button key={k} type="button" aria-label={ta ? HIDDEN_TA.notOnly(nameOf(k)) : `Show all, not only ${nameOf(k)}`} onClick={() => setChosen((c) => ({ ...c, [k]: undefined }))}>
                {nameOf(k)} ×
              </button>
            ))}
            <button type="button" onClick={clear}>
              {T?.clearAll ?? "Clear all"}
            </button>
            <button type="button" className="notes-order" onClick={() => setOldestFirst(!oldestFirst)}>
              {oldestFirst ? (T?.oldest ?? "Oldest first") : (T?.newest ?? "Newest first")} ⇅
            </button>
          </p>
        )}
        <div ref={list}>
          {shown.map((r) => (
            <NoteRow key={r.id} row={words.trim() ? { ...r, href: withSearch(r.href, words, spellings) } : r} withPicture />
          ))}
        </div>
        {!shown.length && <p className="empty">{T?.none ?? "No field notes match this search."}</p>}
      </section>
    </>
  );
}
