"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** A long list, the rest a tap away ("All 17 field notes ↓"), and folded up
    again ("Fewer field notes ↑"): on a phone, the first `shown` of it; on a
    wider screen, with `beside`, as many as end beside the column at its side
    (a temple's field notes, down to where its Ritual Year ends), so what
    follows them (its films, its photographs) is not far below; else all. */
export function ShowMore({
  shown,
  label,
  fewer = "Fewer",
  beside,
  children,
}: {
  shown: number;
  label: string;
  fewer?: string;
  /** the column beside the list, by a selector from its section: its foot is where the list folds */
  beside?: string;
  children: ReactNode[];
}) {
  const [open, setOpen] = useState(false);
  const mark = useRef<HTMLSpanElement>(null);
  // on a wider screen, how many end beside the column (null: all, or not yet measured)
  const [wide, setWide] = useState<number | null>(null);
  const [narrow, setNarrow] = useState(true);
  // measured again (with every row out) whenever the column beside, or the window, changes size
  const [tick, setTick] = useState(0);
  const sideOf = () => (beside ? mark.current?.parentElement?.closest(".temple-body")?.querySelector<HTMLElement>(beside) : null);

  useLayoutEffect(() => {
    const phone = window.innerWidth <= 900;
    setNarrow(phone);
    if (wide !== null) return; // folded already: measured with every row out, as now
    const list = mark.current?.parentElement;
    const side = sideOf();
    if (phone || !list || !side) return;
    const foot = side.getBoundingClientRect().bottom;
    const rows = [...list.querySelectorAll<HTMLElement>(":scope > [data-row]")];
    const fit = rows.filter((r) => r.getBoundingClientRect().bottom <= foot).length;
    if (fit < rows.length) setWide(Math.max(3, fit));
  }, [tick, wide, beside]);

  useLayoutEffect(() => {
    if (open) return;
    const again = () => {
      setWide(null);
      setTick((t) => t + 1);
    };
    const side = sideOf();
    const ro = side ? new ResizeObserver(again) : null;
    if (side && ro) ro.observe(side);
    window.addEventListener("resize", again);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", again);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, beside]);

  const limit = narrow ? shown : wide;
  const rows = children.map((c, i) => (
    <div key={i} data-row="" className="more-row">
      {c}
    </div>
  ));
  if (limit === null || children.length <= limit)
    return (
      <>
        <span ref={mark} hidden />
        {rows}
      </>
    );
  return (
    <>
      <span ref={mark} hidden />
      {rows.slice(0, limit)}
      {open && rows.slice(limit)}
      <button type="button" className="more-button" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? `${fewer} ↑` : `${label} ↓`}
      </button>
    </>
  );
}
