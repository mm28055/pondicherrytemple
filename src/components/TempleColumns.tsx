"use client";

import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* A temple's page below its header: two columns, the page's parts on the
   left, its drawings and Ritual Year on the right; but the parts at the foot
   of the left column (its films, photographs, articles) that begin below
   where the right column ends are taken out of the left column and given the
   page's whole width, under both. Worked out in the browser, as laid out in
   two columns, and again when the window or the right column changes size.
   On a phone, one column, as before (site.css). */
export function TempleColumns({
  className,
  main,
  lower,
  aside,
}: {
  className: string;
  main: ReactNode;
  /** the parts that may go across the page, in order, each by its id */
  lower: { id: string; node: ReactNode }[];
  aside: ReactNode;
}) {
  const side = useRef<HTMLElement>(null);
  // how many of `lower` stay in the left column (null: not yet worked out)
  const [kept, setKept] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (kept !== null) return;
    const el = side.current;
    if (!el || window.innerWidth <= 900) return setKept(lower.length);
    const end = el.getBoundingClientRect().bottom;
    const first = lower.findIndex(({ id }) => {
      const part = document.getElementById(id);
      return part ? part.getBoundingClientRect().top >= end : false;
    });
    setKept(first < 0 ? lower.length : first);
  }, [kept, lower]);

  // laid out again in two columns, and worked out anew, when the window or the right column changes size
  useLayoutEffect(() => {
    const el = side.current;
    if (!el) return;
    let width = window.innerWidth;
    let height = el.offsetHeight;
    const again = () => {
      if (window.innerWidth === width && el.offsetHeight === height) return;
      width = window.innerWidth;
      height = el.offsetHeight;
      setKept(null);
    };
    const ro = new ResizeObserver(again);
    ro.observe(el);
    window.addEventListener("resize", again);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", again);
    };
  }, []);

  const left = kept === null ? lower : lower.slice(0, kept);
  const wide = kept === null ? [] : lower.slice(kept);
  return (
    <>
      <div className={className}>
        <div className="stack">
          {main}
          {left.map(({ id, node }) => (
            <Fragment key={id}>{node}</Fragment>
          ))}
        </div>
        <aside ref={side} className="stack">
          {aside}
        </aside>
      </div>
      {wide.length > 0 && (
        <div className="stack temple-wide">
          {wide.map(({ id, node }) => (
            <Fragment key={id}>{node}</Fragment>
          ))}
        </div>
      )}
    </>
  );
}
