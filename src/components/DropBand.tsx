"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type DropChoice = { id: string; label: string; disabled?: boolean };
export type Drop = {
  key: string;
  label: string;
  /** what it is set to now, shown in place of nothing */
  value: string;
  chosen: string;
  choices: DropChoice[];
  onPick: (id: string) => void;
  /** a few choices: on a computer, listed in the band itself, no dropdown;
      on a phone, the dropdown */
  inline?: boolean;
};

/** A band of dropdowns, as on the Photographs and Films pages, for going
    elsewhere rather than narrowing: each shows what it is set to now, and
    opens across the band, its choices beginning under it. A dropdown closes
    on a choice, a click elsewhere, Escape, or scrolling on. A dropdown of
    only a few choices (`inline`) lists them in the band instead, on a
    computer, where there is room. In the page's
    colour (--mt) where it has one. Used on the Calendar (the year) and on a
    month's page (the month and the year). A `note`, a word on what to do
    on the page, sits at the band's right; `links`, to places further down
    the page, come after the dropdowns, in their face, underlined. */
export function DropBand({
  drops,
  links = [],
  note,
  className = "",
}: {
  drops: Drop[];
  links?: { label: string; href: string }[];
  note?: ReactNode;
  className?: string;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    if (!menu) return;
    const from = window.scrollY;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setMenu(null);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    const scrolled = () => Math.abs(window.scrollY - from) > 40 && setMenu(null);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scrolled, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scrolled);
    };
  }, [menu]);

  const open = drops.find((d) => d.key === menu);
  return (
    <div className={`filter-bar drop-band ${className}`} ref={box}>
      <div className="filter-bar-line">
        {drops.map((d) => (
          <span key={d.key} className={`filter-bar-item${d.inline ? " drop-inline-item" : ""}`}>
            {/* on a computer: the few choices in the band, the one in force underlined */}
            {d.inline && (
              <span className="filters drop-inline" role="group" aria-label={d.label}>
                <span className="drop-inline-label">{d.label}</span>
                {d.choices.map((c) => (
                  <button key={c.id} aria-pressed={c.id === d.chosen} disabled={c.disabled} onClick={() => d.onPick(c.id)}>
                    {c.label}
                  </button>
                ))}
              </span>
            )}
            <button
              ref={(el) => {
                buttons.current[d.key] = el;
              }}
              className={`filter-bar-btn${menu === d.key ? " open" : ""}`}
              aria-expanded={menu === d.key}
              onClick={() => setMenu(menu === d.key ? null : d.key)}
            >
              {d.label} <b>{d.value}</b>
              <i aria-hidden="true">▾</i>
            </button>
          </span>
        ))}
        {links.map((l) => (
          <span key={l.href} className="filter-bar-item">
            <a className="filter-bar-btn drop-band-link" href={l.href}>
              {l.label}
            </a>
          </span>
        ))}
        {note && <p className="drop-band-note">{note}</p>}
      </div>
      {open && (
        <div
          className="filters filter-bar-panel"
          role="group"
          aria-label={open.label}
          // the choices begin under their dropdown (the first one's, at the band's edge)
          style={{ paddingLeft: buttons.current[open.key]?.offsetLeft ?? 0 }}
        >
          {open.choices.map((c) => (
            <button
              key={c.id}
              aria-pressed={c.id === open.chosen}
              disabled={c.disabled}
              onClick={() => {
                setMenu(null);
                open.onPick(c.id);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
