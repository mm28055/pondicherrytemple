import { shareMeta, sharePicture } from "@/lib/share";
import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDictionary,
  getFieldNote,
  getFieldNotes,
  getFieldNotesForTemple,
  getEventNotesAfter,
  getPhotosForNote,
  getObservancesById,
  getRegion,
  getRegions,
  getTemple,
  getTemples,
  hasPage,
} from "@/lib/data";
import { FIELD_KIND_LABELS } from "@/content/labels";
import { NakshatraCard } from "@/components/NakshatraCard";
import { getNakshatraCard } from "@/lib/nakshatraCard";
import { formatDate, localDate } from "@/lib/calendar";
import { noteRow } from "@/lib/view";
import { Html } from "@/components/Prose";
import { GlossCard } from "@/components/GlossCard";
import { markDictionary } from "@/lib/dictionary";
import { FestivalLink } from "@/components/FestivalLink";
import { NotePhotos } from "@/components/NotePhotos";
import { NoteRow } from "@/components/Rows";
import { packPhotos } from "@/lib/photoPack";
import { titleFit } from "@/lib/titleFit";

type Props = { params: Promise<{ id: string }> };

// Notes published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getFieldNotes()).map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getFieldNote((await params).id);
  // shared with the first of its photographs
  return n
    ? shareMeta({ title: n.title, description: `${formatDate(n.date)} · ${n.occasion}`, image: sharePicture((await getPhotosForNote(n.id))[0]) })
    : {};
}

export default async function FieldNotePage({ params }: Props) {
  const note = await getFieldNote((await params).id);
  if (!note) notFound();

  const region = (await getRegion(note.region))!;
  const allTemples = await getTemples(region.id);
  // its temples, in the note's region first, else in the other (a town note may
  // name a temple in and around Pondicherry, as on 1 November 2026)
  const allRegions = await getRegions();
  const temples = (
    await Promise.all(
      note.temples.map(
        async (id) =>
          (await getTemple(note.region, id)) ??
          (await Promise.all(allRegions.map((r) => getTemple(r.id, id)))).find((t) => t !== null) ??
          null
      )
    )
  ).filter((t) => t !== null);
  const observances = await getObservancesById(note.observances);
  const nakshatra = await getNakshatraCard(note.occasion);
  const local = localDate(region.calendar, note.date);

  // more from the temple (the first, if several): five, then its page for all of them
  const temple = temples[0];
  const related = temple
    ? (await getFieldNotesForTemple(region.id, temple.id)).filter((n) => n.id !== note.id)
    : [];

  // the notes before and after this one, by date (the list is newest first)
  const all = await getFieldNotes();
  const dictionary = await getDictionary();
  const at = all.findIndex((n) => n.id === note.id);
  const older = at >= 0 ? all[at + 1] : undefined;
  const newer = at > 0 ? all[at - 1] : undefined;

  // the photographs beside the text: its own (those of its photo sets, the
  // same day at its temples), in the order taken; the viewer's link to their
  // field note left out where that is this page
  const here = `/field-notes/${note.id}`;
  const photosOf = async (slug: string) =>
    (await getPhotosForNote(slug)).map((p) => (p.note?.href === here ? { ...p, note: undefined } : p));

  // the notes of the following days of the same event of the town (its card
  // on the Temples page opens them all), each below the one before, their
  // photographs after these in the column beside
  const following = await Promise.all(
    (await getEventNotesAfter(note.id)).map(async (n) => ({
      note: n,
      local: localDate(region.calendar, n.date),
      observances: await getObservancesById(n.observances),
    }))
  );
  const photos = (await Promise.all([note.id, ...following.map((f) => f.note.id)].map(photosOf)))
    .flat()
    .filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i);

  return (
    <>
      <div className="wrap">
        <header className="note-head">
          <BackLink className="crumb" href="/field-notes">
            ← Field notes
          </BackLink>
          <div className="note-dateline">
            <time className="date" dateTime={note.date}>
              {formatDate(note.date)}
            </time>
            {local && <span className="local">{local}</span>}
          </div>
          <h1 className="note-title" style={titleFit(note.title)}>{note.title}</h1>
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
            {/* an occasion that is a nakshatram (Poosa Nakshatram): opens its card */}
            {nakshatra && <NakshatraCard label={note.occasion} data={nakshatra} />}
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
          ends; the photographs down the left beside it (on a phone, in rows
          above the text) */}
      <GlossCard />
      <div className="wrap note-layout">
        {/* its videos first among its media, at the top of the column; recordings stay with the text */}
        <NotePhotos pack={packPhotos(photos)} videos={note.videos?.filter((v) => v.type === "video")} seed={note.id} />
        <div className="note-text">
          <article className="note-body">
            {note.body && <Html className="rich" html={markDictionary(note.body, dictionary)} />}

            {note.videos
              ?.filter((v) => v.type === "audio")
              .map((v) => (
                <figure key={v.src} className="media">
                  <audio controls preload="metadata" src={v.src} />
                  {v.caption && <figcaption>{v.caption}</figcaption>}
                </figure>
              ))}
          </article>

          {/* the photographs the column beside has no room for, opened from its last one (NotePhotos) */}
          <div id="note-more-photos" />

          {following.map(({ note: n, local, observances }) => (
            <article key={n.id} className="note-body note-next">
              <div className="note-dateline">
                <time className="date" dateTime={n.date}>
                  {formatDate(n.date)}
                </time>
                {local && <span className="local">{local}</span>}
              </div>
              <h2 className="note-title" style={titleFit(n.title)}>
                <Link href={`/field-notes/${n.id}`}>{n.title}</Link>
              </h2>
              {observances.length > 0 && (
                <div className="note-meta caps">
                  {observances.map((o) => (
                    <FestivalLink key={o.id} id={o.id}>
                      {o.name}
                    </FestivalLink>
                  ))}
                </div>
              )}
              {n.body && <Html className="rich" html={markDictionary(n.body, dictionary)} />}
            </article>
          ))}

          {temple && related.length > 0 && (
            <div className="note-foot">
              <h2 className="sub-head">More from {temple.knownAs ?? temple.name}</h2>
              {related.slice(0, 5).map((n) => (
                <NoteRow key={n.id} row={noteRow(n, allTemples, region.calendar)} />
              ))}
              {related.length > 5 && (
                <Link className="more-button" href={`/${temple.region}/${temple.id}#all-field-notes`}>
                  See all field notes →
                </Link>
              )}
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
