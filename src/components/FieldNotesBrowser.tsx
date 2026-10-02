"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { NoteRowData } from "@/lib/view";
import { NoteRow } from "./Rows";

/** The Field Notes tab: everything recorded in the field, newest first.
    The filter only appears once there is more than one kind to choose. */
export function FieldNotesBrowser({
  rows,
  kinds,
}: {
  rows: NoteRowData[];
  kinds: { kind: string; label: string; count: number }[];
}) {
  const [kind, setKind] = useState<string>("all");
  const shown = useMemo(() => (kind === "all" ? rows : rows.filter((r) => r.kind === kind)), [rows, kind]);

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

  return (
    <>
      {kinds.length > 1 && (
        <div className="filters" role="group" aria-label="Show">
          <button aria-pressed={kind === "all"} onClick={() => setKind("all")}>
            Everything<span className="count">{rows.length}</span>
          </button>
          {kinds.map((k) => (
            <button key={k.kind} aria-pressed={kind === k.kind} onClick={() => setKind(k.kind)}>
              {k.label}
              <span className="count">{k.count}</span>
            </button>
          ))}
        </div>
      )}
      <div ref={list}>
        {shown.map((r) => (
          <NoteRow key={r.id} row={r} withPicture />
        ))}
      </div>
    </>
  );
}
