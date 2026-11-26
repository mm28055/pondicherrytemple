"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { searchTerms } from "@/lib/searchWords";
import { WRITINGS_TA } from "@/content/writingsTa";
import { isHit, useNoteSearch, type BrowsedNote, type NoteFilter, type Quote, type Suggestion, type SuggestGroup } from "./useNoteSearch";

const NONE: never[] = [];
const BLOCKS = "p, li, blockquote, h2, h3, h4, figcaption, td, th";

/** Takes away the marks put on a text. */
function unmark(root: HTMLElement) {
  const parents = new Set<Node>();
  for (const m of root.querySelectorAll("mark.note-hit")) {
    if (m.parentNode) parents.add(m.parentNode);
    m.replaceWith(document.createTextNode(m.textContent ?? ""));
  }
  for (const p of parents) p.normalize();
}

/** Marks each word of a text that is one of the spellings searched for, and
    gives the marks in order. */
function mark(root: HTMLElement, spellings: string[]): HTMLElement[] {
  unmark(root);
  if (!spellings.length) return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest("script, style, audio, button, .gloss-card") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const marks: HTMLElement[] = [];
  for (const node of nodes) {
    const text = node.data;
    const hits = [...text.matchAll(/[\p{L}\p{M}\p{N}]+/gu)].filter((m) => isHit(m[0], spellings));
    if (!hits.length) continue;
    const frag = document.createDocumentFragment();
    let at = 0;
    for (const h of hits) {
      const i = h.index ?? 0;
      if (i > at) frag.append(text.slice(at, i));
      const el = document.createElement("mark");
      el.className = "note-hit";
      el.textContent = h[0];
      frag.append(el);
      marks.push(el);
      at = i + h[0].length;
    }
    if (at < text.length) frag.append(text.slice(at));
    node.replaceWith(frag);
  }
  return marks;
}

/** Some words either side of a mark, from its paragraph. */
function quoteOf(m: HTMLElement, root: HTMLElement): Quote {
  const block = (m.closest(BLOCKS) as HTMLElement | null) ?? root;
  const range = document.createRange();
  range.setStart(block, 0);
  range.setEnd(m, 0);
  const at = range.toString().length;
  const text = block.textContent ?? "";
  const word = m.textContent ?? "";
  let from = Math.max(0, at - 40);
  let to = Math.min(text.length, at + word.length + 60);
  if (from > 0) from = text.indexOf(" ", from) + 1 || from;
  if (to < text.length) to = text.lastIndexOf(" ", to) > at + word.length ? text.lastIndexOf(" ", to) : to;
  return { before: (from > 0 ? "…" : "") + text.slice(from, at), word, after: text.slice(at + word.length, to) + (to < text.length ? "…" : "") };
}

/** The search box on a field note, at the right of its back link, and with it
    under the site's header once that is scrolled past, so that what was
    searched stays in sight while reading. Come to from a search (?q=…), the
    note opens with those words marked and goes to the first of them. What is
    typed here is marked in the note as it is typed; the suggestions are in
    two parts: the places in this note, each going to its place, then the
    other notes, temples and festivals that have it, as on the Field Notes page
    (useNoteSearch), whose words are fetched only once someone goes to search. */
export function NoteSearch({ noteId, ta = false }: { noteId: string; ta?: boolean }) {
  const T = ta ? WRITINGS_TA : null;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [given, setGiven] = useState<string[] | null>(null); // the spellings come with the address (w)
  const [index, setIndex] = useState<{ rows: BrowsedNote[]; filters: NoteFilter[] } | null>(null);
  const [texts, setTexts] = useState<Record<string, string> | null>(null);
  const [panel, setPanel] = useState(false);
  const [open, setOpen] = useState(false); // on a phone, the box open
  const [active, setActive] = useState(-1);
  const [marks, setMarks] = useState<HTMLElement[]>([]);
  const fetched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const arrived = useRef(false);
  const words = useDeferredValue(query);
  const base = ta ? "/ta/field-notes" : "/field-notes";

  const fetchIndex = useCallback(() => {
    if (fetched.current) return;
    fetched.current = true;
    Promise.all([fetch(`${base}/search-index`), fetch(`${base}/text`)].map((p) => p.then((r) => (r.ok ? r.json() : Promise.reject()))))
      .then(([i, t]) => {
        setIndex(i);
        setTexts(t);
      })
      .catch(() => {
        fetched.current = false; // tried again at the next search
      });
  }, [base]);

  // what the address asks for, on arriving
  useEffect(() => {
    const at = new URLSearchParams(window.location.search);
    const q = at.get("q") ?? "";
    const w = at.get("w");
    setQuery(q);
    setGiven(w ? w.split(" ").filter(Boolean) : null);
    if (q) setOpen(true);
    arrived.current = Boolean(q);
  }, [noteId]);
  // then the address follows what is typed, so that the note can be come back to as it is
  const typed = useRef(false);
  useEffect(() => {
    if (!typed.current) return;
    const q = query.trim();
    window.history.replaceState(window.history.state, "", q ? `?${new URLSearchParams({ q })}` : window.location.pathname);
  }, [query]);

  const { readTerms, groups } = useNoteSearch({ rows: index?.rows ?? NONE, filters: index?.filters ?? NONE, texts, query, ta, except: noteId });

  // the spellings marked in the note: those come with the address, until something
  // else is typed; else, with the notes' words here, as the search reads them
  const spellings = useMemo(() => {
    if (given) return given;
    if (index) return readTerms(words).flatMap((r) => r.as);
    return searchTerms(words);
  }, [given, index, readTerms, words]);

  // the marks in the note, following the words; come to from a search, to the first
  useEffect(() => {
    let found: HTMLElement[] = [];
    const apply = () => {
      const root = document.querySelector<HTMLElement>(".note-text");
      if (!root) return;
      found = mark(root, spellings);
      // (a new list only when there are marks or were: else the same, not to render again)
      setMarks((was) => (found.length || was.length ? found : was));
      if (arrived.current && found.length) {
        found[0].classList.add("on");
        // (once the photographs beside have taken their room)
        const first = found[0];
        setTimeout(() => first.isConnected && first.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
      }
    };
    apply();
    // the page still settling as it opens, its text may be put in again: marked again then
    const again = [300, 900, 2000].map((ms) =>
      setTimeout(() => {
        if (found.length && found.every((m) => m.isConnected)) return;
        apply();
      }, ms),
    );
    const done = setTimeout(() => (arrived.current = false), 2100);
    return () => {
      again.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [spellings, noteId]);
  useEffect(() => () => {
    const root = document.querySelector<HTMLElement>(".note-text");
    if (root) unmark(root);
  }, []);

  // a press elsewhere closes the suggestions, as Escape does
  useEffect(() => {
    if (!panel) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setPanel(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [panel]);

  // the two parts: in this note, then the others
  const parts = useMemo(() => {
    const out: { head: string; groups: SuggestGroup[] }[] = [];
    if (!searchTerms(query).length) return out;
    const root = document.querySelector<HTMLElement>(".note-text");
    const here: Suggestion[] = root ? marks.slice(0, 8).map((m, nth) => ({ type: "here" as const, nth, label: "", quote: quoteOf(m, root) })) : [];
    out.push({
      head: ta ? `இந்தக் குறிப்பில் · ${marks.length}` : `In this note · ${marks.length}`,
      groups: [{ items: here }],
    });
    out.push({ head: ta ? "மற்ற குறிப்புகளில்" : "In other notes", groups });
    return out;
  }, [query, marks, groups, ta]);
  const flat = useMemo(() => parts.flatMap((p) => p.groups.flatMap((g) => g.items)), [parts]);
  useEffect(() => setActive(-1), [query]);

  const goTo = (nth: number) => {
    for (const m of marks) m.classList.remove("on");
    const m = marks[nth];
    if (!m) return;
    m.classList.add("on");
    m.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const pick = (s: Suggestion) => {
    setPanel(false);
    input.current?.blur();
    if (s.type === "here") return goTo(s.nth);
    if (s.type === "note") return router.push(s.href);
    if (s.type === "choice") return router.push(`${base}?${new URLSearchParams({ [s.key]: s.id })}`);
    if (s.type === "words" && s.query) {
      setGiven(null);
      setQuery(s.query);
      return;
    }
    router.push(`${base}?${new URLSearchParams({ q: query.trim() })}`);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setPanel(false);
    if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) pick(flat[active]);
      else if (marks.length) {
        setPanel(false);
        goTo(0);
      } else pick({ type: "words", label: "" });
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
  const clear = () => {
    typed.current = true;
    setGiven(null);
    setQuery("");
    setPanel(false);
    setOpen(false);
  };

  const glass = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
  let index_ = -1;
  const item = (s: Suggestion) => {
    index_ += 1;
    const at = index_;
    const quote = s.type === "here" || s.type === "note" ? s.quote : undefined;
    return (
      <li
        key={s.type === "here" ? `here${s.nth}` : s.type === "note" ? s.href : s.type === "choice" ? `${s.key}${s.id}` : `words${s.query ?? ""}`}
        id={`note-suggest-${at}`}
        role="option"
        aria-selected={active === at}
        className={active === at ? "notes-suggest-item on" : "notes-suggest-item"}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => pick(s)}
      >
        <span>
          {s.type !== "here" && s.label}
          {quote && (
            <small className={s.type === "here" ? "notes-suggest-quote here" : "notes-suggest-quote"}>
              {quote.before}
              <b>{quote.word}</b>
              {quote.after}
            </small>
          )}
        </span>
        {s.type === "choice" && <span>{s.count}</span>}
        {s.type === "note" && <span>{s.date}</span>}
      </li>
    );
  };

  return (
    <div className={`note-search-line${open ? " open" : ""}`}>
      <div className="note-search-in">
        <div className={`notes-search${open ? " open" : ""}${query ? " filled" : ""}`} ref={box}>
          <button
            type="button"
            className="notes-search-go"
            aria-label={T?.search ?? "Search the field notes"}
            onClick={() => {
              flushSync(() => {
                setOpen(true);
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
            aria-controls="note-suggest"
            aria-activedescendant={active >= 0 ? `note-suggest-${active}` : undefined}
            aria-label={T?.search ?? "Search the field notes"}
            placeholder={T?.search ?? "Search field notes"}
            value={query}
            onChange={(e) => {
              typed.current = true;
              setGiven(null);
              setQuery(e.target.value);
              setPanel(true);
            }}
            onFocus={() => {
              fetchIndex();
              if (query) setPanel(true);
            }}
            onKeyDown={onKey}
          />
          {(query || open) && (
            <button type="button" className="notes-search-x" aria-label={T?.clearSearch ?? "Clear the search"} onClick={clear}>
              ×
            </button>
          )}
          {panel && parts.length > 0 && (
            <ul className="notes-suggest" id="note-suggest" role="listbox" aria-label={T?.suggestions ?? "Suggestions"}>
              {parts.map((p) => (
                <li key={p.head} role="presentation" className="notes-suggest-part">
                  <div className="notes-suggest-part-head">{p.head}</div>
                  {p.groups.every((g) => !g.items.length) && (
                    <div className="notes-suggest-none">{index || p.groups === parts[0].groups ? (ta ? "இல்லை" : "None") : "…"}</div>
                  )}
                  {p.groups.map((g, n) =>
                    g.items.length ? (
                      <div key={g.head ?? n} role="presentation">
                        {g.head && <div className="notes-suggest-head">{g.head}</div>}
                        <ul role="presentation" style={{ listStyle: "none" }}>
                          {g.items.map(item)}
                        </ul>
                      </div>
                    ) : null,
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
