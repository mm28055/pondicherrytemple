import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDummyPhotos,
  getEthosSets,
  getFieldNotesForTemple,
  getObservances,
  isAround,
  getOccasions,
  getPhotosForTemple,
  getRegion,
  getTemples,
  hasPage,
} from "@/lib/data";
import { Html } from "@/components/Prose";
import { ethosTa, TEMPLES_PAGE_TA } from "@/content/templeTa";
import { tamilOf } from "@/lib/tamilPages";
import { daysTa, photosTa, tamilTemple } from "@/lib/viewTa";
import { TempleRow, TempleRowPlain } from "@/components/Rows";
import { PhotoWall } from "@/components/PhotoWall";
import { seeded } from "@/lib/mahotsavam";
import type { Photo, Temple } from "@/content/types";
import { TodayTamil } from "@/components/TodayTamil";
import { calendarEvents } from "@/lib/calendarEvents";
import { formatDays } from "@/lib/calendar";
import { onePerEvent, photoCount } from "@/lib/photoPack";

/** A town's Temples page; with `ta`, in Tamil (its words: content/templeTa). */
export async function RegionView({ regionId, ta = false }: { regionId: string; ta?: boolean }) {
  const T = ta ? TEMPLES_PAGE_TA : null;
  const inTamil = (t: Temple) => (ta ? tamilTemple(t) : t);
  // a temple's page, in the language of this one
  const pageOf = (t: Temple) => (ta ? tamilOf(`/${t.region}/${t.id}`) : undefined);
  const region = await getRegion(regionId);
  if (!region) notFound();

  // the temples listed on this page (a temple can be left off it in the admin),
  // by the name they are shown under, from Z to A
  const shownName = (t: Temple) => t.knownAs ?? t.name;
  const temples = (await getTemples(region.id))
    .filter((t) => t.listed)
    .sort((a, b) => shownName(b).localeCompare(shownName(a)));
  // a temple's latest events, one photograph of each (newest first), and how
  // many photographs it has; stand-ins for a temple with none yet
  // (and the day of its latest photograph or field note, for ordering the temples in and around)
  const every = ta ? [...(await getTemples(region.id)), ...(await getTemples(`in-and-around-${region.id}`))] : [];
  const tags = ta ? await getObservances() : [];
  const inTamilPhotos = (list: Photo[]) => (ta ? photosTa(list, every, tags) : list);
  const latest = async (t: Temple) => {
    const own = await getPhotosForTemple(t.region, t.id);
    const notes = await getFieldNotesForTemple(t.region, t.id);
    const last = [...own.filter((p) => p.dated).map((p) => p.date), ...notes.map((n) => n.date)].sort().at(-1) ?? "";
    return own.length
      ? { t, photos: inTamilPhotos(onePerEvent(own, 12)), total: own.length, stand: false, last }
      : {
          t,
          photos: await getDummyPhotos(`latest-${t.id}`, 12),
          total: 24 + Math.floor(seeded(`count-${t.id}`)() * 100),
          stand: true,
          last,
        };
  };
  // each temple by its name, its proper name and its street alone, and a row of
  // its latest events
  const withPages = await Promise.all(temples.filter(hasPage).map(latest));
  const others = temples.filter((t) => !hasPage(t));

  // Temples outside the town live in their own region, "In and around <town>"
  // (address in-and-around-<town>), and are listed at the foot of the town's page.
  const around = await getRegion(`in-and-around-${region.id}`);
  // the most recently visited first: by the day of its latest photograph or field note
  const aroundTemples = around
    ? (
        await Promise.all(
          (await getTemples(around.id))
            .filter((t) => t.listed && hasPage(t))
            .map(latest),
        )
      ).sort((a, b) => b.last.localeCompare(a.last))
    : [];
  // to the temple's own Photographs page (a temple in and around the town has
  // all its photographs on its page itself, at its foot; stand-ins, its page)
  const toPhotos = (t: Temple, total: number, stand: boolean) => ({
    href: isAround(t) || stand ? `${pageOf(t) ?? `/${t.region}/${t.id}`}#photographs` : `${ta ? "/ta" : ""}/${t.region}/${t.id}/photographs`,
    total,
    title: T?.photosOf(photoCount(total), inTamil(t).knownAs!) ?? `All ${photoCount(total)} photographs of ${t.knownAs ?? t.name}`,
  });

  // The Town's Cultural and Spiritual Ethos: the town's photo sets of that name, each a card
  const ethos = await getEthosSets(region.id);
  const nameOf = (title: string) => (ta ? ethosTa(title) : title);

  // today's date, as on the home page, for the box in the header
  const todayEvents = await calendarEvents(await getOccasions(), ta);

  const page = (
    <>
      <div className="wrap">
        {/* today's date and the way to the calendar, as on the home page: on a
            computer the same box, at the header's right; on a phone a small
            one beside the title */}
        <header className="page-head landing-head with-today">
          <div className="kicker">{T?.place ?? region.name}</div>
          <h1 className="page-title">{T?.title ?? "Temples"}</h1>
          <TodayTamil events={todayEvents} ta={ta} />
          <Html className="page-lede" html={T ? T.intro.map((p) => `<p>${p}</p>`).join("") : region.intro} />
        </header>

        <section className="section temple-list">
          {/* each temple's name, and its photographs in line with it */}
          {withPages.map(({ t, photos, total, stand }) => (
            <div key={t.id} className="temple-entry">
              <TempleRow temple={inTamil(t)} formal href={pageOf(t)} />
              {/* its last photo, dimmed, counts the rest: a link to the temple's Photographs page */}
              {photos.length > 0 && (
                <PhotoWall
                  photos={photos}
                  layout="row"
                  note={T?.latest ?? "Latest from this temple"}
                  reveal
                  addressable={false}
                  ta={ta}
                  moreLink={toPhotos(t, total, stand)}
                />
              )}
            </div>
          ))}
        </section>

        {others.length > 0 && (
          <section className="section tight">
            <h2 className="sub-head">{T?.also ?? "Also being documented"}</h2>
            <p className="note-line">
              {T?.alsoNote ?? "Each of these gets its own page once its first notes are ready."}
            </p>
            {others.map((t) => (
              <TempleRowPlain key={t.id} temple={inTamil(t)} />
            ))}
          </section>
        )}
      </div>

      {/* Beyond the town: past the wall's stripes, across the whole window, the
          temples in and around it, each a card, its row of photographs over its name. */}
      {around && aroundTemples.length > 0 && (
        <section className="around" id={around.id}>
          <div className="stripes around-wall" aria-hidden="true" />
          <div className="wrap">
            <div className="around-head">
              <h2>
                {/* (both, in either language) */}
                <span lang="en">{around.name}</span> <span lang="ta">சுற்றுவட்டாரம்</span>
              </h2>
              {/* The region's Introduction (Admin → Regions), or this line if it is empty. */}
              <p className="note-line">
                {T?.aroundNote || around.introText ||
                  `Temples outside ${region.name} that are part of this study.`}
              </p>
            </div>
            <div className="temple-cards">
              {aroundTemples.map(({ t, photos, total, stand }) => (
                <div key={t.id} className="temple-card">
                  <PhotoWall
                    photos={photos}
                    layout="row"
                    note={T?.latest ?? "Latest from this temple"}
                    reveal
                    addressable={false}
                    ta={ta}
                    moreLink={toPhotos(t, total, stand)}
                  />
                  <TempleRow temple={inTamil(t)} formal href={pageOf(t)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The Town's Cultural and Spiritual Ethos: as the temples in and around it, past the
          wall's stripes, each a card, a row of its photographs (a press opens
          them, to go through them all) over its name and day, which opens its
          field note when it has one. */}
      {ethos.length > 0 && (
        <section className="around ethos" id="hindu-ethos">
          <div className="stripes around-wall" aria-hidden="true" />
          <div className="wrap">
            <div className="around-head">
              <h2>
                <span lang="en">The Town&apos;s Cultural and Spiritual Ethos</span> <span lang="ta">ஊரின் ஆன்மிக மரபு</span>
              </h2>
            </div>
            <div className="temple-cards">
              {ethos.map((e) => (
                <div key={e.id} className="temple-card">
                  <PhotoWall
                    photos={inTamilPhotos(e.photos)}
                    ta={ta}
                    layout="row"
                    note={nameOf(e.title)}
                    addressable={false}
                    moreLink={{ total: e.photos.length, title: T ? T.photosOf(photoCount(e.photos.length), nameOf(e.title)) : `All ${photoCount(e.photos.length)} photographs` }}
                    reveal
                  />
                  {/* its name opens its field note (those of all its days), when there is one */}
                  {e.notes.length > 0 ? (
                    <Link className="temple-row plain" href={`${ta ? "/ta" : ""}/field-notes/${e.notes[0]}`}>
                      <div>
                        <div className="temple-name">{nameOf(e.title)}</div>
                        {e.dates.length > 0 && <div className="temple-sub">{ta ? daysTa(e.dates) : formatDays(e.dates)}</div>}
                      </div>
                    </Link>
                  ) : (
                    <div className="temple-row plain">
                      <div>
                        <div className="temple-name">{nameOf(e.title)}</div>
                        {e.dates.length > 0 && <div className="temple-sub">{ta ? daysTa(e.dates) : formatDays(e.dates)}</div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
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
