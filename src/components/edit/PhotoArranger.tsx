"use client";

/* Admin2's photos panel (the bar's Photos button, or photos dropped onto the
   page): the page's photographs — a festival's, a temple's or a field
   note's — as small pictures, as in its form in /admin
   (components/admin/TaggedPhotoGrid), and saved the same way, so the two
   always agree:
   - dragged into the order the page shows them in (one, or the chosen
     together), or put newest or oldest first by when each was taken, then
     Save order (lib/photoOrders); or back in the site's own order;
   - more added (dropped here or on the page, or Add photos), made ready in
     this browser as the admin makes them (lib/photoUpload) and tagged with
     the festival or temple (a note's with its temples and festivals, in its
     day's photo set, or else in the note itself);
   - a festival's or temple's chosen ones taken off it, kept in the library.
   Deleting a photo stays in /admin. A pop-up: Back, Escape or × closes it. */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AT_ONCE, minutes, slugify, uploadPhoto } from "@/lib/photoUpload";
import { editStore, type PhotoAreaInfo } from "./editStore";

type Photo = {
  id: number;
  url?: string | null;
  sizes?: { thumbnail?: { url?: string | null } | null } | null;
  set?: number | null;
  taken?: string | null;
};

const WHAT = { observances: "festival", temples: "temple", "field-notes": "field note" } as const;

const errorOf = async (res: Response) =>
  ((await res.json().catch(() => ({}))) as { errors?: { message?: string }[] }).errors?.[0]?.message ?? res.statusText;

export function PhotoArranger({ area, files }: { area: PhotoAreaInfo; files: File[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [ordered, setOrdered] = useState(false);
  const [order, setOrder] = useState<number[] | null>(null);
  const [chosen, setChosen] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [dropOn, setDropOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const last = useRef<number | null>(null);
  const tagged = area.kind !== "field-notes";

  const load = useCallback(async () => {
    const res = await fetch(`/api/photo-orders/photos?kind=${area.kind}&id=${area.id}`, { credentials: "include" });
    if (!res.ok) {
      setStatus(`The photos could not be read: ${await errorOf(res)}`);
      setPhotos([]);
      return [];
    }
    const body = (await res.json()) as { photos?: Photo[]; ordered?: boolean };
    setPhotos(body.photos ?? []);
    setOrdered(Boolean(body.ordered));
    setOrder(null);
    return body.photos ?? [];
  }, [area.kind, area.id]);

  // opened at once, as a pop-up; its photos read; any dropped on the page added
  useEffect(() => {
    dialog.current?.showModal();
    void load().then((had) => {
      if (files.length) void add(files, had);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (order && !window.confirm("Leave without saving the new order?")) return;
    dialog.current?.close();
  };

  const byId = new Map((photos ?? []).map((p) => [p.id, p]));
  const shown = order ? order.map((i) => byId.get(i)!).filter(Boolean) : (photos ?? []);

  const choose = (pid: number, e: React.MouseEvent) => {
    const next = new Set(chosen);
    if (e.shiftKey && last.current !== null) {
      const ids = shown.map((p) => p.id);
      const [a, b] = [ids.indexOf(last.current), ids.indexOf(pid)].sort((x, y) => x - y);
      ids.slice(a, b + 1).forEach((i) => next.add(i));
    } else if (next.has(pid)) next.delete(pid);
    else next.add(pid);
    last.current = pid;
    setChosen(next);
  };

  // the photo dragged (or, if it is chosen, all the chosen) put before the one it is dropped on
  const moveTo = (target: number) => {
    if (dragging === null || dragging === target) return;
    const ids = shown.map((p) => p.id);
    const moving = chosen.has(dragging) ? ids.filter((i) => chosen.has(i)) : [dragging];
    if (moving.includes(target)) return;
    const rest = ids.filter((i) => !moving.includes(i));
    const from = ids.indexOf(dragging);
    const at = rest.indexOf(target) + (ids.indexOf(target) > from ? 1 : 0);
    rest.splice(at, 0, ...moving);
    setOrder(rest);
  };

  const byDate = (newest: boolean) => {
    const when = (p: Photo) => p.taken ?? "";
    const sorted = [...shown].sort((a, b) => {
      const x = when(a);
      const y = when(b);
      if (!x || !y) return (x ? 0 : 1) - (y ? 0 : 1) || a.id - b.id;
      return (newest ? y.localeCompare(x) : x.localeCompare(y)) || a.id - b.id;
    });
    setOrder(sorted.map((p) => p.id));
  };

  const saveOrder = async (ids: number[]) => {
    setBusy(true);
    setStatus(ids.length ? "Saving the order…" : "Going back to the site’s own order…");
    try {
      const res = await fetch("/api/photo-orders/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: area.kind, id: area.id, ids }),
      });
      if (!res.ok) throw new Error(await errorOf(res));
      setStatus(ids.length ? "Order saved: the page shows it now." : "Back in the site’s own order.");
      await load();
      router.refresh();
    } catch (e) {
      setStatus(`The order was not saved: ${(e as Error).message}`);
    }
    setBusy(false);
  };

  // a festival's or temple's chosen photos taken off it (their other tags kept)
  const untag = async () => {
    const ids = [...chosen];
    if (!ids.length || !window.confirm(`Take ${ids.length} photo${ids.length === 1 ? "" : "s"} off this ${WHAT[area.kind]}? They stay in the photo library.`)) return;
    setBusy(true);
    let done = 0;
    try {
      for (const pid of ids) {
        setStatus(`Taking them off… ${done} of ${ids.length}`);
        const m = (await (await fetch(`/api/media/${pid}?depth=0`, { credentials: "include" })).json()) as Record<string, unknown>;
        const had = (Array.isArray(m[area.kind]) ? m[area.kind] : []) as (number | { id: number })[];
        const res = await fetch(`/api/media/${pid}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [area.kind]: had.map((r) => (typeof r === "object" ? r.id : r)).filter((x) => x !== area.id) }),
        });
        if (!res.ok) throw new Error(await errorOf(res));
        done++;
      }
      setStatus(`${done} taken off this ${WHAT[area.kind]}, kept in the photo library.`);
    } catch (e) {
      setStatus(`Stopped after ${done}: ${(e as Error).message}`);
    }
    setChosen(new Set());
    await load();
    router.refresh();
    setBusy(false);
  };

  // photos added: tagged; a note's in the photo set most of its photos are in, else in the note itself
  const add = async (list: File[], had = photos ?? []) => {
    list = list.filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    const sets = new Map<number, number>();
    for (const p of had) if (p.set) sets.set(p.set, (sets.get(p.set) ?? 0) + 1);
    const set = tagged ? undefined : [...sets].sort((a, b) => b[1] - a[1])[0]?.[0];
    const data = { ...area.tags, ...(set ? { set } : {}) };
    const stem = slugify(area.slug || WHAT[area.kind]);
    const started = Date.now();
    const made: number[] = [];
    const failed: string[] = [];
    let done = 0;
    const tell = () => {
      const left = list.length - done;
      const eta = done ? ` · ${minutes(((Date.now() - started) / done) * left)} left` : "";
      setStatus(`Adding photos: ${done} of ${list.length}${left ? eta : ""}${failed.length ? ` · ${failed.length} failed` : ""}`);
    };
    tell();
    let next = 0;
    const worker = async () => {
      while (next < list.length) {
        const file = list[next++];
        try {
          made.push(await uploadPhoto(file, stem, data));
        } catch (e) {
          failed.push(`${file.name} (${(e as Error).message})`);
        }
        done++;
        tell();
      }
    };
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, list.length) }, worker));
    // a note with no photo set: the new photos put in the note itself
    if (!tagged && !set && made.length) {
      const res = await fetch("/next/edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collection: "field-notes", id: area.id, field: "photos.add", value: made }),
      });
      if (!res.ok) failed.push(`putting them in the note (${(await res.json().catch(() => ({})))?.error ?? res.status})`);
    }
    setStatus(
      `${made.length} of ${list.length} photo${list.length === 1 ? "" : "s"} added, in ${minutes(Date.now() - started).replace("about ", "")}.` +
        (failed.length ? ` Not added: ${failed.join("; ")}` : ""),
    );
    await load();
    router.refresh();
    setBusy(false);
  };

  return (
    <dialog
      ref={dialog}
      className={`arrange-dialog${dropOn ? " drop-on" : ""}`}
      aria-label={`Photos of ${area.label}`}
      onClose={() => editStore.doneArranging()}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDropOn(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.target === dialog.current) setDropOn(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDropOn(false);
        if (!busy) void add([...e.dataTransfer.files]);
      }}
    >
      <div className="arrange-head">
        <h2>
          Photos of {area.label}
          {photos && <span className="arrange-count"> · {photos.length}</span>}
        </h2>
        <button type="button" className="arrange-x" aria-label="Close" onClick={close}>
          ×
        </button>
      </div>
      <div className="arrange-tools">
        <button type="button" className="arrange-main" disabled={busy} onClick={() => input.current?.click()}>
          Add photos
        </button>
        {order && (
          <>
            <button type="button" className="arrange-main" disabled={busy} onClick={() => saveOrder(order)}>
              Save order
            </button>
            <button type="button" disabled={busy} onClick={() => setOrder(null)}>
              Undo moves
            </button>
          </>
        )}
        <button type="button" disabled={busy || shown.length < 2} onClick={() => byDate(true)}>
          Newest first
        </button>
        <button type="button" disabled={busy || shown.length < 2} onClick={() => byDate(false)}>
          Oldest first
        </button>
        {ordered && !order && (
          <button type="button" disabled={busy} onClick={() => saveOrder([])}>
            Back to the site’s order
          </button>
        )}
        {tagged && chosen.size > 0 && (
          <button type="button" disabled={busy} onClick={untag}>
            Take {chosen.size} off this {WHAT[area.kind]}
          </button>
        )}
        {chosen.size > 0 && (
          <button type="button" disabled={busy} onClick={() => setChosen(new Set())}>
            Unchoose
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const list = [...(e.target.files ?? [])];
            e.target.value = "";
            void add(list);
          }}
        />
      </div>
      <p className="arrange-status" aria-live="polite">
        {status ??
          (photos === null
            ? "Reading its photos…"
            : "Drag a photo to move it; click to choose several (shift-click for a run) and drag them together. Drop photos from your computer here to add them.")}
      </p>
      <div className="arrange-grid">
        {shown.map((p, i) => (
          <div
            key={p.id}
            className={`arrange-photo${chosen.has(p.id) ? " chosen" : ""}${over === p.id && dragging !== p.id ? " over" : ""}${dragging === p.id ? " moving" : ""}`}
            draggable={!busy}
            onDragStart={(e) => {
              setDragging(p.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            onDragOver={(e) => {
              if (dragging === null) return;
              e.preventDefault();
              setOver(p.id);
            }}
            onDrop={(e) => {
              if (dragging === null) return;
              e.preventDefault();
              e.stopPropagation();
              moveTo(p.id);
              setDragging(null);
              setOver(null);
            }}
            onClick={(e) => choose(p.id, e)}
            title={p.taken ? new Date(p.taken).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.sizes?.thumbnail?.url ?? p.url ?? ""} alt="" draggable={false} loading="lazy" />
            <span className="arrange-n">{i + 1}</span>
          </div>
        ))}
      </div>
    </dialog>
  );
}
