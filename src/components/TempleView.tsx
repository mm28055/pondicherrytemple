import { EditPhotos } from "@/components/edit/EditPhotos";
import { BackLink } from "@/components/BackLink";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticlesForTemple,
  getFieldNotesForTemple,
  getFilmsForTemple,
  getIllustrationsForTemple,
  getObservances,
  getPhotoFilters,
  getOrderedPhotosForTemple,
  getPhotosForTemple,
  getRegion,
  getTemple,
  getTempleRitualYear,
  getTempleStories,
  getTemples,
  getDummyPhotos,
  getDictionary,
  hasPage,
  isAround,
  layoutsOf,
  withPlaceholderLayouts,
} from "@/lib/data";
import { articleRow, filmTile, noteRow, templesOf } from "@/lib/view";
import { Drawings } from "@/components/Drawings";
import { FilmWall } from "@/components/FilmWall";
import { PhotoWall } from "@/components/PhotoWall";
import type { Photo } from "@/content/types";
import { occasionTa } from "@/content/notesTa";
import { said, TEMPLE_INTROS_TA, TEMPLE_TA, TEMPLES_PAGE_TA } from "@/content/templeTa";
import { tamilOf } from "@/lib/tamilPages";
import { dateTa, filmTileTa, photosTa, rowTa, tamilTemple } from "@/lib/viewTa";
import { latestEvent, leadPhotos, packPhotos, photoCount } from "@/lib/photoPack";
import { formatDate } from "@/lib/calendar";
import { NoteRow } from "@/components/Rows";
import { TempleYear } from "@/components/TempleYear";
import { ShowMore } from "@/components/ShowMore";
import { FoldedIntro } from "@/components/FoldedIntro";
import { GlossCard } from "@/components/GlossCard";
import { markDictionary, markDictionaryTa } from "@/lib/dictionary";
import { DICTIONARY_TA } from "@/content/dictionaryTa";
import { TempleLayout } from "@/components/TempleLayout";
import { TempleColumns } from "@/components/TempleColumns";
import { ReservedLink } from "@/components/ReservedLink";
import { TEMPLE_STORIES_PUBLISHED } from "@/lib/festivals";
import { titleFit } from "@/lib/titleFit";
import { getEditable, getYearEdit, isEditing } from "@/lib/editing";
import { EditRich, EditText } from "@/components/edit/Editable";
import type { Temple } from "@/content/types";

/* A temple's page. The header: the name, and the temple's plan as a card at
   the right that hangs over the line below. Then two columns: on the left the
   introduction, a link to "The Temple and its Stories", field notes, films, photographs and articles;
   on the right its drawings and the ritual year, month by month, newest
   first: the festivals seen in each. (First designed on the Chetty Koil page, October 2026.) */
export async function TempleView({ regionId, templeId, ta = false }: { regionId: string; templeId: string; ta?: boolean }) {
  // in Tamil (/ta), the same page with its words in Tamil (content/templeTa)
  const T = ta ? TEMPLE_TA : null;
  const region = await getRegion(regionId);
  const english = await getTemple(regionId, templeId);
  const t = english && ta ? tamilTemple(english) : english;
  if (!region || !t || !hasPage(t)) notFound();
  // Admin2 (lib/editing): its names, street and introduction as editable boxes
  if (isAround(t)) return <AroundTemplePage regionId={region.id} regionName={region.name} templeId={t.id} ta={ta} />;

  const ed = !ta && (await isEditing()) ? await getEditable("temples", t.id) : null;
  const allTemples = await getTemples(region.id);
  const year = await getTempleRitualYear(region.id, t.id);
  const notes = (await getFieldNotesForTemple(region.id, t.id)).map((n) => {
    const row = noteRow(n, allTemples, region.calendar);
    return ta ? rowTa(row, allTemples, n, true) : row;
  });
  const articles = (await getArticlesForTemple(t.id)).map((a) => articleRow(a, region.calendar));
  const films = (await getFilmsForTemple(region.id, t.id)).map((f) => {
    return ta ? filmTileTa(f, allTemples) : filmTile(f, allTemples);
  });
  const drawings = await getIllustrationsForTemple(region.id, t.id);
  const tags = ta ? await getObservances() : [];
  const inTamil = (list: Photo[]) => (ta ? photosTa(list, allTemples, tags) : list);
  const own = inTamil(await getPhotosForTemple(region.id, t.id));
  // as put in order by hand in the admin, if they have been
  const ordered = await getOrderedPhotosForTemple(region.id, t.id);
  const byHand = { ...ordered, photos: inTamil(ordered.photos) };
  // stand-ins until it has photographs of its own
  const photos = own.length ? own : await getDummyPhotos(t.id, 6);
  // Its histories, the place, its people, its stories and songs: on a page of their own.
  const hasStories = (await getTempleStories(region.id, t.id)).length > 0;
  // its layouts, as a stack in the header (the first on top; placeholders until they are drawn); its other drawings in the right-hand column
  const layouts = withPlaceholderLayouts(t.id, region.id, layoutsOf(drawings), t.faces).map((d) =>
    !T ? d : d.comingSoon ? { ...d, title: T.layoutTitle, alt: T.layoutTitle } : { ...d, title: said(d.title) }
  );
  const otherDrawings = drawings.filter((d) => d.kind !== "plan");
  const plan = layouts[0];

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <EditPhotos kind="temples" slug={t.id} label={t.knownAs ?? t.name} />
      <header className="page-head temple-head">
        <div>
          <BackLink className="crumb" href={ta ? tamilOf(`/${region.id}`)! : `/${region.id}`}>
            ← {T?.templesOfTown ?? templesOf(region.name)}
          </BackLink>
          <TempleHeadNames t={t} ed={ed} />
        </div>
        {/* The temple's layouts, turned on their sides, stacked, the top one
            hanging over the line below the header at the right of the
            right-hand column. Every temple's layout is shown this way. */}
        {plan && (
          <div className="temple-head-drawing">
            <TempleLayout layouts={layouts} words={T ? { see: T.layoutSee, soon: T.layoutSoon } : undefined} />
          </div>
        )}
      </header>

      {/* two columns; the films, photographs and articles across the page
          where they begin below the end of the right column (components/TempleColumns) */}
      <TempleColumns
        className={plan ? "two-col temple-body below-layout" : "two-col temple-body"}
        main={
          <>
            {/* on a phone, where the Ritual Year comes after everything else: the page's parts, a tap away */}
            <nav className="page-parts" aria-label={T?.onThisPage ?? "On this page"}>
              <a href="#ritual-year">{T?.cycles ?? "Ritual Cycles"} ↓</a>
              {notes.length > 0 && <a href="#field-notes">{T?.notes ?? "Field notes"} ↓</a>}
              {films.length > 0 && <a href="#films">{T?.films ?? "Films"} ↓</a>}
              {photos.length > 0 && <a href="#photographs">{T?.photographs ?? "Photographs"} ↓</a>}
              {articles.length > 0 && <a href="#articles">{T?.articles ?? "Articles"} ↓</a>}
            </nav>

            {/* its introduction (Admin → Temples), its dictionary words marked
                (lib/dictionary); a note in its place until it is written */}
            {ed ? (
              <div className="temple-intro">
                <EditRich className="prose" target={{ collection: "temples", id: ed.id, field: "intro", label: "Temple introduction" }} {...ed.rich("intro")} styles="short" />
              </div>
            ) : ta && TEMPLE_INTROS_TA[t.id] ? (
              <div className="temple-intro">
                <GlossCard ta />
                <FoldedIntro html={markDictionaryTa(TEMPLE_INTROS_TA[t.id].map((p) => `<p>${p}</p>`).join(""), markDictionary(t.intro ?? "", await getDictionary()), DICTIONARY_TA)} more="மேலும் வாசிக்க →" />
              </div>
            ) : t.intro ? (
              <div className="temple-intro">
                <GlossCard />
                <FoldedIntro html={markDictionary(t.intro, await getDictionary())} />
              </div>
            ) : (
              <p className="note-line">{T?.beingWritten ?? "An introduction to the temple is being written."}</p>
            )}

            {hasStories && (
              // held in reserve until published: plain words, "(coming soon)", to the public
              <ReservedLink
                className="arrow-link"
                href={`/${region.id}/${t.id}/temple-and-its-stories`}
                published={TEMPLE_STORIES_PUBLISHED}
                soon={ta ? "(விரைவில்)" : undefined}
              >
                {T?.stories ?? "Explore the temple's history and stories"}
              </ReservedLink>
            )}

            {notes.length > 0 && (
              <section id="field-notes">
                <h2 id="all-field-notes" className="sub-head">{T?.notes ?? "Field notes"}</h2>
                {/* on a phone, the latest five, the rest a tap away, so the Ritual Year is not far below;
                    on a wider screen, those beside the Ritual Year, so its films and photographs come up after */}
                <ShowMore shown={5} label={T?.allNotes(notes.length) ?? `All ${notes.length} field notes`} fewer={T?.fewerNotes ?? "Fewer field notes"} beside=":scope > aside" openAt="all-field-notes">
                  {notes.map((r) => (
                    <NoteRow key={r.id} row={r} />
                  ))}
                </ShowMore>
              </section>
            )}
          </>
        }
        lower={[
          // its films, then its photographs
          ...(films.length > 0
            ? [
                {
                  id: "films",
                  node: (
                    <section id="films">
                      <h2 className="sub-head large">{T?.films ?? "Films"}</h2>
                      <FilmWall tiles={films} ta={ta} />
                    </section>
                  ),
                },
              ]
            : []),
          ...(photos.length > 0
            ? [
                {
                  id: "photographs",
                  node: (
                    <section id="photographs">
                      <h2 className="sub-head large">{T?.photographs ?? "Photographs"}</h2>
                      <LatestPhotos own={own} stand={photos} seeAll={`${ta ? "/ta" : ""}/${region.id}/${t.id}/photographs`} byHand={byHand} ta={ta} />
                    </section>
                  ),
                },
              ]
            : []),
          ...(articles.length > 0
            ? [
                {
                  id: "articles",
                  node: (
                    <section id="articles">
                      <h2 className="sub-head large">{T?.articles ?? "Articles"}</h2>
                      {articles.map((r) => (
                        <NoteRow key={r.id} row={r} />
                      ))}
                    </section>
                  ),
                },
              ]
            : []),
        ]}
        aside={
          <>
            {otherDrawings.length > 0 && <Drawings items={otherDrawings} />}

            <section id="ritual-year">
              <h2 id="ritual-cycles" className="sub-head">{T?.cycles ?? "Ritual Cycles"}</h2>
              <TempleYear year={year} day={t.day} edit={ed ? await getYearEdit(ed.id) : undefined} ta={ta} />
            </section>
          </>
        }
      />
    </div>
  );
}

/** A temple in and around the town: part of the story, not at the centre of
    the documentation. A simpler page, for now just its field notes,
    photographs and films (stand-in photographs until it has its own). To be
    designed. Few photographs: all of them on the page itself, as on a
    temple's own Photographs page (each day or event under its heading,
    newest or oldest first), with no page of their own to go to. */
async function AroundTemplePage({ regionId, regionName, templeId, ta }: { regionId: string; regionName: string; templeId: string; ta: boolean }) {
  const T = ta ? TEMPLE_TA : null;
  const english = (await getTemple(regionId, templeId))!;
  const t = ta ? tamilTemple(english) : english;
  const ed = !ta && (await isEditing()) ? await getEditable("temples", t.id) : null;
  // the town these temples are around: its temples, for the notes' tags
  const town = regionId.replace(/^in-and-around-/, "");
  const townRegion = await getRegion(town);
  const allTemples = [...(await getTemples(town)), ...(await getTemples(regionId))];
  const notes = (await getFieldNotesForTemple(regionId, t.id)).map((n) => {
    const row = noteRow(n, allTemples, townRegion?.calendar ?? "tamil");
    return ta ? rowTa(row, allTemples, n, true) : row;
  });
  const films = (await getFilmsForTemple(regionId, t.id)).map((f) => {
    return ta ? filmTileTa(f, allTemples) : filmTile(f, allTemples);
  });
  const tags = ta ? await getObservances() : [];
  const inTamil = (list: Photo[]) => (ta ? photosTa(list, allTemples, tags) : list);
  const own = inTamil(await getPhotosForTemple(regionId, t.id));
  const ordered = await getOrderedPhotosForTemple(regionId, t.id);
  const byHand = { ...ordered, photos: inTamil(ordered.photos) };
  const photos = own.length ? own : await getDummyPhotos(t.id, 6);
  const filters = (own.length ? await getPhotoFilters(own, ["observances", "years"]) : []).map((f) =>
    !T
      ? f
      : f.key === "observances"
        ? { ...f, label: T.festivalFilter, options: f.options.map((o) => ({ ...o, label: said(o.label) })) }
        : { ...f, label: T.yearFilter }
  );

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <EditPhotos kind="temples" slug={t.id} label={t.knownAs ?? t.name} />
      <header className="page-head">
        <BackLink className="crumb" href={`${(ta && tamilOf(`/${town}`)) || `/${town}`}#${regionId}`}>
          ← {ta ? TEMPLES_PAGE_TA.around : regionName}
        </BackLink>
        <TempleHeadNames t={t} ed={ed} />
      </header>
      <div className="stack around-temple">
        {/* its films above its photographs: beside its field notes, in a column at the right, if it has any */}
        {notes.length > 0 && films.length > 0 ? (
          <div className="two-col around-cols">
            <section>
              <h2 id="all-field-notes" className="sub-head">{T?.notes ?? "Field notes"}</h2>
              {notes.map((r) => (
                <NoteRow key={r.id} row={r} />
              ))}
            </section>
            <section id="films">
              <h2 className="sub-head large">{T?.films ?? "Films"}</h2>
              <FilmWall tiles={films} ta={ta} />
            </section>
          </div>
        ) : (
          <>
            {notes.length > 0 && (
              <section>
                <h2 id="all-field-notes" className="sub-head">{T?.notes ?? "Field notes"}</h2>
                {notes.map((r) => (
                  <NoteRow key={r.id} row={r} />
                ))}
              </section>
            )}
            {films.length > 0 && (
              <section id="films">
                <h2 className="sub-head large">{T?.films ?? "Films"}</h2>
                <FilmWall tiles={films} ta={ta} />
              </section>
            )}
          </>
        )}
        <section id="photographs">
          <h2 className="sub-head large">{T?.photographs ?? "Photographs"}</h2>
          {own.length ? (
            <PhotoWall pack={packPhotos(own)} layout="all" filters={filters} heads={{ here: t.shortName ?? t.knownAs ?? t.name }} ta={ta} />
          ) : (
            <LatestPhotos own={own} stand={photos} seeAll="" byHand={byHand} ta={ta} />
          )}
        </section>
      </div>
    </div>
  );
}

/** A temple's photographs on its page: its latest day or event (or two, when
    the latest has only a few), headed with each one's date and occasion,
    and the way to all of them (or stand-ins, without a head, until it has
    photographs of its own). Put in order by hand in the admin: the first
    of them, in that order, without a head. */
function LatestPhotos({
  own,
  stand,
  seeAll,
  byHand,
  ta = false,
}: {
  own: Photo[];
  stand: Photo[];
  seeAll: string;
  byHand: { photos: Photo[]; ordered: boolean };
  ta?: boolean;
}) {
  const all = ta ? TEMPLE_TA.allPhotos(photoCount(own.length)) : undefined;
  if (!own.length) return <PhotoWall photos={leadPhotos(stand)} total={stand.length} layout="lead" />;
  if (byHand.ordered) return <PhotoWall photos={byHand.photos.slice(0, 6)} total={own.length} layout="lead" seeAll={seeAll} seeAllWords={all} asGiven ta={ta} />;
  const { photos, heads } = latestEvent(own);
  return (
    <>
      {heads.map((head, i) => (
        <div key={i} className="photo-group-head">
          <span className="date">{head.date ? (ta ? dateTa(head.date) : formatDate(head.date)) : ta ? TEMPLE_TA.dayNotKnown : "Day not known"}</span>
          {head.occasion && <span>{ta ? occasionTa(head.occasion) : head.occasion}</span>}
        </div>
      ))}
      <PhotoWall photos={photos} total={own.length} layout="lead" seeAll={seeAll} seeAllWords={all} ta={ta} />
    </>
  );
}

/** A temple's names and street, in its header: the name it is known by,
    large; its other name and street below, split by the red lingam mark.
    In Admin2 (lib/editing), each a box to edit. */
function TempleHeadNames({ t, ed }: { t: Temple; ed: Awaited<ReturnType<typeof getEditable>> }) {
  const title = t.knownAs ?? t.name;
  const other = t.knownAs && t.knownAs !== t.name;
  const box = (field: "knownAs" | "name" | "street", label: string, value: string, as?: "h1") =>
    ed ? (
      <EditText
        as={as}
        className={as ? "temple-title" : undefined}
        style={as ? titleFit(title) : undefined}
        value={ed.text(field) || value}
        target={{ collection: "temples", id: ed.id, field, label }}
        required={field === "name"}
      />
    ) : as ? (
      <h1 className="temple-title" style={titleFit(title)}>{value}</h1>
    ) : (
      <span>{value}</span>
    );
  return (
    <>
      {box(t.knownAs ? "knownAs" : "name", "Temple name", title, "h1")}
      <div className="temple-facts caps">
        {other && box("name", "Other name", t.name)}
        {/* the red mark between them, as on the home page: a lingam on its base */}
        {other && t.street && <span className="lingam" aria-hidden="true" />}
        {t.street && box("street", "Street", t.street)}
      </div>
    </>
  );
}
