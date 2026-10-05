import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFieldNote,
  getFieldNotes,
  getFieldNotesForTemple,
  getPhotos,
  getObservancesById,
  getRegion,
  getTemple,
  getTemples,
  hasPage,
} from "@/lib/data";
import { FIELD_KIND_LABELS } from "@/content/labels";
import { formatDate, localMonth } from "@/lib/calendar";
import { noteRow } from "@/lib/view";
import { Html } from "@/components/Prose";
import { NoteRow } from "@/components/Rows";
import { FestivalLink } from "@/components/FestivalLink";
import { NotePhotos } from "@/components/NotePhotos";
import { seeded } from "@/lib/mahotsavam";

type Props = { params: Promise<{ id: string }> };

// Notes published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getFieldNotes()).map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getFieldNote((await params).id);
  return n ? { title: n.title, description: `${formatDate(n.date)} · ${n.occasion}` } : {};
}

export default async function FieldNotePage({ params }: Props) {
  const note = await getFieldNote((await params).id);
  if (!note) notFound();

  const region = (await getRegion(note.region))!;
  const allTemples = await getTemples(region.id);
  const temples = (await Promise.all(note.temples.map((id) => getTemple(note.region, id)))).filter(
    (t) => t !== null
  );
  const observances = await getObservancesById(note.observances);
  const local = localMonth(region.calendar, note.date);

  // more from the same temple(s)
  const related = (await Promise.all(temples.map((t) => getFieldNotesForTemple(region.id, t.id))))
    .flat()
    .filter((n, i, all) => n.id !== note.id && all.findIndex((x) => x.id === n.id) === i)
    .slice(0, 3)
    .map((n) => noteRow(n, allTemples, region.calendar));

  // the notes before and after this one, by date (the list is newest first)
  const all = await getFieldNotes();
  const at = all.findIndex((n) => n.id === note.id);
  const older = at >= 0 ? all[at + 1] : undefined;
  const newer = at > 0 ? all[at - 1] : undefined;

  // the photographs beside the text: dummies for now, the site's own, in an
  // order fixed by the note
  const r = seeded(note.id);
  const dummies = (await getPhotos())
    .map((p) => ({ p, k: r() }))
    .sort((a, b) => a.k - b.k)
    .map(({ p: { id, medium, alt, focus, width, height } }) => ({ id, medium, alt, focus, width, height }));

  return (
    <>
      <div className="wrap">
        <header className="note-head">
          <Link className="crumb" href="/field-notes">
            ← Field notes
          </Link>
          <div className="note-dateline">
            <time className="date" dateTime={note.date}>
              {formatDate(note.date)}
            </time>
            {local && <span className="local">{local}</span>}
          </div>
          <h1 className="note-title">{note.title}</h1>
          <div className="note-meta caps">
            {note.kind !== "note" && <span>{FIELD_KIND_LABELS[note.kind].one}</span>}
            {temples.map((t) =>
              hasPage(t) ? (
                <Link key={t.id} href={`/${t.region}/${t.id}`}>
                  {t.knownAs ?? t.name}
                </Link>
              ) : (
                <span key={t.id}>{t.knownAs ?? t.name}</span>
              )
            )}
            {observances.map((o) => (
              <FestivalLink key={o.id} id={o.id}>
                {o.name}
              </FestivalLink>
            ))}
            {note.authors.length > 0 && <span>By {note.authors.join(" and ")}</span>}
          </div>
        </header>
      </div>

      {/* the text in a column at the right, ending where the line above
          ends; the photographs down the left beside it */}
      <div className="wrap note-layout">
        <NotePhotos photos={dummies} seed={note.id} />
        <div className="note-text">
          <article className="note-body">
            {note.body && <Html className="rich" html={note.body} />}

            {note.videos?.map((v) => (
              <figure key={v.src} className="media">
                {v.type === "video" ? (
                  <video controls preload="metadata" src={v.src} poster={v.poster} />
                ) : (
                  <audio controls preload="metadata" src={v.src} />
                )}
                {v.caption && <figcaption>{v.caption}</figcaption>}
              </figure>
            ))}
          </article>

          {related.length > 0 && (
            <div className="note-foot">
              <h2 className="sub-head">More from here</h2>
              {related.map((r) => (
                <NoteRow key={r.id} row={r} />
              ))}
            </div>
          )}

          {/* on to the note before or after this one */}
          {(older || newer) && (
            <nav className="note-step" aria-label="More field notes">
              {older ? (
                <Link className="note-step-link prev" href={`/field-notes/${older.id}`}>
                  <span className="note-step-label">← Previous</span>
                  <span className="note-step-title">{older.title}</span>
                  <span className="note-step-date">{formatDate(older.date)}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link className="note-step-link next" href={`/field-notes/${newer.id}`}>
                  <span className="note-step-label">Next →</span>
                  <span className="note-step-title">{newer.title}</span>
                  <span className="note-step-date">{formatDate(newer.date)}</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
