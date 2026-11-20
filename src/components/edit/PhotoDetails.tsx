"use client";

/* Admin2, in the full-screen photo viewer (components/PhotoWall): the
   photo's own details as boxes — the day it was taken, its caption, its
   credit, and the few words beside it — saved to the photo itself (its
   entry in the photo library, the same as in /admin). The viewer covers
   the Admin2 bar, so a line of its own here offers Save and Cancel while a
   box is open (Enter saves; Ctrl+Enter for the few words; Escape cancels). */

import { Fragment, useEffect, useState, useSyncExternalStore } from "react";
import { formatDate } from "@/lib/calendar";
import { EditText } from "./Editable";
import { editStore } from "./editStore";

export function PhotoDetails({ id, date, dated, caption, credit, description }: {
  id: string;
  date: string;
  dated: boolean;
  caption?: string;
  credit?: string;
  description?: string;
}) {
  const { open, busy, message } = useSyncExternalStore(editStore.subscribe, editStore.get, editStore.get);
  // what the photo itself holds (the page leaves some out, a credit among them), read afresh
  const [own, setOwn] = useState<{ caption?: string; credit?: string; description?: string; version: number } | null>(null);
  useEffect(() => {
    let live = true;
    setOwn(null);
    fetch(`/api/media/${id}?depth=0`, { credentials: "include" })
      .then((r) => r.json())
      .then((m: { caption?: string | null; credit?: string | null; description?: string | null }) => {
        if (live) setOwn({ caption: m.caption ?? "", credit: m.credit ?? "", description: m.description ?? "", version: Date.now() });
      })
      .catch(() => live && setOwn({ caption, credit, description, version: 0 }));
    return () => {
      live = false;
    };
  }, [id, caption, credit, description, date]);
  const target = (field: string, label: string) => ({ collection: "media", id: Number(id), field, label: `${label} (this photo)` });
  return (
    <>
      <EditText className="caps" value={dated ? formatDate(date) : ""} placeholder="Taken on (14 November 2026)" target={target("takenOn", "Taken on")} />
      {own && (
        <Fragment key={own.version}>
          <EditText className="photo-viewer-caption" value={own.caption ?? ""} placeholder="Caption" target={target("caption", "Caption")} />
          <EditText className="photo-viewer-credit" value={own.credit ?? ""} placeholder="Credit" target={target("credit", "Credit")} />
          <EditText className="photo-viewer-about" long value={own.description ?? ""} placeholder="A few words beside it" target={target("description", "Few words")} />
        </Fragment>
      )}
      <span className="photo-edit-line">
        {open ? (
          <>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => open.cancel()} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="save" onMouseDown={(e) => e.preventDefault()} onClick={() => void open.save()} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </>
        ) : (
          message || "Admin2: double-click a detail to change it"
        )}
      </span>
    </>
  );
}
