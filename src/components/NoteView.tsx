import { EditPhotos } from "@/components/edit/EditPhotos";
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
  getObservances,
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
import { markDictionary, markDictionaryTa } from "@/lib/dictionary";
import { DICTIONARY_TA } from "@/content/dictionaryTa";
import { KINDS_TA, templeTa } from "@/content/homeTa";
import { noteBodyTa } from "@/content/noteBodiesTa";
import { titleTa } from "@/content/notesTa";
import { said } from "@/content/saidTa";
import { WRITINGS_TA } from "@/content/writingsTa";
import type { FieldNote, Temple } from "@/content/types";
import { tamilOf } from "@/lib/tamilPages";
import { dateTa, photosTa, rowTa, tamilDateOf } from "@/lib/viewTa";
import { FestivalLink } from "@/components/FestivalLink";
import { NotePhotos } from "@/components/NotePhotos";
import { NoteSearch } from "@/components/NoteSearch";
import { NoteRow } from "@/components/Rows";
import { packPhotos } from "@/lib/photoPack";
import { titleFit, titleFitTa } from "@/lib/titleFit";
import { getEditable, isEditing } from "@/lib/editing";
import { EditRich, EditText } from "@/components/edit/Editable";



/** A field note; with `ta`, in Tamil (content/noteBodiesTa; its text in
    English, until it is there). */
export async function NoteView({ id: noteId, ta = false }: { id: string; ta?: boolean }) {
  const T = ta ? WRITINGS_TA : null;
  const note = await getFieldNote(noteId);
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
  // (a nakshatram's card is in English only: not on the Tamil page)
  const nakshatra = ta ? null : await getNakshatraCard(note.occasion);
  const localOf = (iso: string) => (ta ? tamilDateOf(iso) : localDate(region.calendar, iso));
  const dayOf = (iso: string) => (ta ? dateTa(iso) : formatDate(iso));
  const titleOf = (n: { id: string; title: string }) => (ta ? titleTa(n.id, n.title) : n.title);
  const nameOf = (t: Temple) => (ta ? templeTa(t.id, t.knownAs ?? t.name) : (t.knownAs ?? t.name));
  const kindOf = (o: { name: string; tamil?: string }) => (ta ? o.tamil || said(o.name) : o.name);
  const fit = ta ? titleFitTa : titleFit;
  const hrefOf = (path: string) => (ta && tamilOf(path)) || path;
  const local = localOf(note.date);

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
      local: localOf(n.date),
      observances: await getObservancesById(n.observances),
    }))
  );
  // Admin2 (lib/editing): its title and texts as editable boxes
  const editing = !ta && (await isEditing());
  const editable = editing
    ? Object.fromEntries(await Promise.all([note.id, ...following.map((f) => f.note.id)].map(async (id) => [id, await getEditable("field-notes", id)] as const)))
    : {};
  const editRich = (id: string, title: string) => {
    const ed = editable[id];
    if (!ed) return null;
    const { html, blocks } = ed.rich("body");
    return <EditRich className="rich" target={{ collection: "field-notes", id: ed.id, field: "body", label: title }} html={html} blocks={blocks} photos={{ slug: id, tags: { temples: ed.refs("temples"), observances: ed.refs("observances") } }} />;
  };
  const mine = editable[note.id];

  const english = (await Promise.all([note.id, ...following.map((f) => f.note.id)].map(photosOf)))
    .flat()
    .filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i);

  const photos = ta ? photosTa(english, (await Promise.all(allRegions.map((r) => getTemples(r.id)))).flat(), await getObservances()) : english;
  // a text as the page shows it, its dictionary words marked
  const textOf = (id: string, body: string) => {
    const marked = markDictionary(body, dictionary);
    const tamil = ta ? noteBodyTa(id, body) : null;
    return tamil === null ? <Html className="rich" html={marked} /> : <Html className="rich" html={markDictionaryTa(tamil, marked, DICTIONARY_TA)} />;
  };
  const rowOf = (n: FieldNote) => {
    const row = noteRow(n, allTemples, region.calendar);
    return ta ? rowTa(row, allTemples, n, true) : row;
  };

  const page = (
    <>
      {/* the back link and the search, on a line that stays under the site's
          header once scrolled up to it */}
      <div className="note-crumb-line">
        <div className="wrap">
          <BackLink className="crumb" href={hrefOf("/field-notes")} stays>
            ← {T?.notes ?? "Field notes"}
          </BackLink>
          <NoteSearch noteId={note.id} ta={ta} />
        </div>
      </div>
      <div className="wrap">
        <header className="note-head">
          <div className="note-dateline">
            <time className="date" dateTime={note.date}>
              {dayOf(note.date)}
            </time>
            {local && <span className="local">{local}</span>}
          </div>
          {mine ? (
            <EditText as="h1" className="note-title" style={titleFit(note.title)} value={mine.text("title")} target={{ collection: "field-notes", id: mine.id, field: "title", label: "Note title" }} required />
          ) : (
            <h1 className="note-title" style={fit(titleOf(note))}>{titleOf(note)}</h1>
          )}
          <div className="note-meta caps">
            {note.kind !== "note" && <span>{ta ? (KINDS_TA[note.kind] ?? FIELD_KIND_LABELS[note.kind].one) : FIELD_KIND_LABELS[note.kind].one}</span>}
            {temples.map((t) =>
              hasPage(t) ? (
                <Link key={t.id} href={hrefOf(`/${t.region}/${t.id}`)}>
                  {nameOf(t)}
                </Link>
              ) : (
                <span key={t.id}>{nameOf(t)}</span>
              )
            )}
            {/* an occasion that is a nakshatram (Poosa Nakshatram): opens its card */}
            {nakshatra && <NakshatraCard label={note.occasion} data={nakshatra} />}
            {observances.map((o) => (
              <FestivalLink key={o.id} id={o.id}>
                {kindOf(o)}
              </FestivalLink>
            ))}
            {note.authors.length > 0 && <span>By {note.authors.join(" and ")}</span>}
          </div>
        </header>
      </div>

      {/* the text in a column at the right, ending where the line above
          ends; the photographs down the left beside it (on a phone, in rows
          above the text) */}
      {/* Admin2: its photos, for the bar's Photos button */}
      {!ta && <EditPhotos kind="field-notes" slug={note.id} label={note.title} />}
      <GlossCard ta={ta} />
      <div className="wrap note-layout">
        {/* its videos first among its media, at the top of the column; recordings stay with the text */}
        <NotePhotos pack={packPhotos(photos)} videos={note.videos?.filter((v) => v.type === "video")} seed={note.id} ta={ta} />
        <div className="note-text">
          <article className="note-body">
            {editing ? editRich(note.id, "Note text") : note.body && textOf(note.id, note.body)}

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
                  {dayOf(n.date)}
                </time>
                {local && <span className="local">{local}</span>}
              </div>
              <h2 className="note-title" style={fit(titleOf(n))}>
                <Link href={hrefOf(`/field-notes/${n.id}`)}>{titleOf(n)}</Link>
              </h2>
              {observances.length > 0 && (
                <div className="note-meta caps">
                  {observances.map((o) => (
                    <FestivalLink key={o.id} id={o.id}>
                      {kindOf(o)}
                    </FestivalLink>
                  ))}
                </div>
              )}
              {editing ? editRich(n.id, `Text of ${formatDate(n.date)}`) : n.body && textOf(n.id, n.body)}
            </article>
          ))}
        </div>
      </div>

      {/* under the note and its photographs, across the page from margin to
          margin: more from its temple, each with its photograph, as on the
          Field Notes page; then on to the note before or after (decided 18
          November 2026: the photographs stop level with the text) */}
      <div className="wrap note-after">
        {temple && related.length > 0 && (
          <div className="note-foot">
            <h2 className="sub-head">{T?.more(nameOf(temple)) ?? `More from ${temple.knownAs ?? temple.name}`}</h2>
            {related.slice(0, 5).map((n) => (
              <NoteRow key={n.id} row={rowOf(n)} withPicture />
            ))}
            {related.length > 5 && (
              <Link className="more-button" href={`${hrefOf(`/${temple.region}/${temple.id}`)}#all-field-notes`}>
                {T?.allNotes ?? "See all field notes →"}
              </Link>
            )}
          </div>
        )}
  
        {/* on to the note before or after this one */}
        {(older || newer) && (
          <nav className="note-step" aria-label={T?.moreNotes ?? "More field notes"}>
            {older ? (
              <Link className="note-step-link prev" href={hrefOf(`/field-notes/${older.id}`)}>
                <span className="note-step-label">{T?.before ?? "← Previous"}</span>
                <span className="note-step-title">{titleOf(older)}</span>
                <span className="note-step-date">{dayOf(older.date)}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link className="note-step-link next" href={hrefOf(`/field-notes/${newer.id}`)}>
                <span className="note-step-label">{T?.after ?? "Next →"}</span>
                <span className="note-step-title">{titleOf(newer)}</span>
                <span className="note-step-date">{dayOf(newer.date)}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
  return ta ? (
    <div className="in-ta" lang="ta">
      {page}
    </div>
  ) : (
    page
  );
}
