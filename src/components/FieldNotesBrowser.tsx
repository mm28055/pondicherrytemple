"use client";

import { useMemo, useState } from "react";
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
      <div>
        {shown.map((r) => (
          <NoteRow key={r.id} row={r} />
        ))}
      </div>
    </>
  );
}
