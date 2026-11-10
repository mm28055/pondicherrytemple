"use client";

import Link from "next/link";
import { useRef } from "react";
import { NakshatraIcon } from "@/components/NakshatraIcon";
import { formatDate } from "@/lib/calendar";
import type { NakshatraCardData } from "@/lib/nakshatraCard";

/* A note's occasion that is a nakshatram ("Poosa Nakshatram"), among the
   note's tags: it opens a card of that nakshatram's observances, each temple
   with what it keeps and the notes on it there (lib/nakshatraCard). A
   <dialog>, so Back closes it (components/DialogBack). */
export function NakshatraCard({ label, data }: { label: string; data: NakshatraCardData }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="nak-open caps" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
        {label}
      </button>
      <dialog ref={dialog} className="day-dialog nak-card" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <button type="button" className="day-close" onClick={() => dialog.current?.close()} aria-label="Close">
          ×
        </button>
        <div className="day-head nak-head">
          <span className="nak-icon" aria-hidden="true">
            <NakshatraIcon n={data.k} />
          </span>
          <span>
            <span className="nak-name">{data.name} Nakshatram</span>
            <span className="day-local" lang="ta">
              {data.tamil}
            </span>
          </span>
        </div>
        <ul className="day-events">
          {data.rows.map((r, i) => (
            <li key={i}>
              <span className={r.tbc ? "cal-line tbc" : "cal-line"}>
                {r.tbc && (
                  <abbr className="tbc-mark" title="To be confirmed">
                    TBC
                  </abbr>
                )}
                {r.temple.href ? (
                  <Link className="cal-place" href={r.temple.href}>
                    {r.temple.name}
                  </Link>
                ) : (
                  <span className="cal-place">{r.temple.name}</span>
                )}
                {r.what && <span className="cal-label"> · {r.what}</span>}
                {r.time && <span className="cal-label"> · {r.time}</span>}
              </span>
              {r.about && <p className="nak-about">{r.about}</p>}
              {r.notes.length > 0 && (
                <ul className="nak-notes">
                  {r.notes.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href}>
                        <span className="nak-date caps">{formatDate(n.date)}</span> {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
