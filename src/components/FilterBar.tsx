"use client";

import { useEffect, useRef, useState } from "react";
import { stripeWidth, useStripeFit } from "@/lib/stripes";

export type BarFilter = {
  key: string;
  label: string;
  options: { id: string; label: string }[];
};

/** The filters of a page of photographs or films: one line, a dropdown for
    each way of narrowing (its choices A to Z; years newest first) and the
    order, which stays under the menu as the page scrolls. Once something is
    chosen the dropdown shows it in place of its name, with a × to clear it.
    A dropdown closes on a choice, a click elsewhere, Escape, or scrolling
    on. With `stripes`, the bar is as wide as rows of photos hung from the
    stripes at the top of the page (lib/stripes). */
export function FilterBar({
  filters,
  chosen,
  onPick,
  oldestFirst,
  onOrder,
  stripes = false,
}: {
  filters: BarFilter[];
  chosen: Partial<Record<string, string>>;
  onPick: (key: string, id: string | null) => void;
  oldestFirst: boolean;
  onOrder: () => void;
  stripes?: boolean;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const fit = useStripeFit(top);

  useEffect(() => {
    if (!menu) return;
    const from = window.scrollY;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setMenu(null);
    };
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

  const nameOf = (fl: BarFilter) => fl.options.find((o) => o.id === chosen[fl.key])?.label;
  const alphabetical = (fl: BarFilter) =>
    [...fl.options].sort((a, b) => (fl.key === "years" ? b.label.localeCompare(a.label) : a.label.localeCompare(b.label)));

  // a choice closes the dropdown; and if the bar is stuck at the top of the
  // screen, the page goes back to the first of what is now shown
  const pick = (key: string, id: string | null) => {
    onPick(key, id);
    setMenu(null);
    const at = top.current?.getBoundingClientRect().top;
    if (at !== undefined && at < 0) {
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 0;
      window.scrollTo({ top: at + window.scrollY - navH });
    }
  };

  return (
    <>
      <div ref={top} aria-hidden="true" />
      <div
        className="filter-bar"
        ref={box}
        style={stripes && fit ? { width: stripeWidth(fit.units), marginLeft: -fit.back } : undefined}
      >
        <div className="filter-bar-line">
          {filters.map((fl) => (
            <span key={fl.key} className="filter-bar-item">
              <button
                className={`filter-bar-btn${menu === fl.key ? " open" : ""}`}
                aria-expanded={menu === fl.key}
                onClick={() => setMenu(menu === fl.key ? null : fl.key)}
              >
                {nameOf(fl) ? <b>{nameOf(fl)}</b> : fl.label}
                <i aria-hidden="true">▾</i>
              </button>
              {chosen[fl.key] && (
                <button className="filter-bar-clear" aria-label={`Show all, not only ${nameOf(fl)}`} onClick={() => pick(fl.key, null)}>
                  ×
                </button>
              )}
            </span>
          ))}
          <button className="filter-bar-btn filter-bar-sort" onClick={onOrder}>
            {oldestFirst ? "Oldest first" : "Newest first"} <i aria-hidden="true">⇅</i>
          </button>
        </div>
        {filters
          .filter((fl) => fl.key === menu)
          .map((fl) => (
            <div key={fl.key} className="filters filter-bar-panel" role="group" aria-label={fl.label}>
              <button aria-pressed={!chosen[fl.key]} onClick={() => pick(fl.key, null)}>
                All
              </button>
              {alphabetical(fl).map((o) => (
                <button key={o.id} aria-pressed={chosen[fl.key] === o.id} onClick={() => pick(fl.key, o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}
