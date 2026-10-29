import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDummyPhotos,
  getEthosSets,
  isAround,
  getOccasions,
  getPhotosForTemple,
  getRegion,
  getRegions,
  getTemples,
  hasPage,
} from "@/lib/data";
import { Html } from "@/components/Prose";
import { templesOf } from "@/lib/view";
import { TempleRow, TempleRowPlain } from "@/components/Rows";
import { PhotoWall } from "@/components/PhotoWall";
import { seeded } from "@/lib/mahotsavam";
import type { Temple } from "@/content/types";
import { TodayTamil } from "@/components/TodayTamil";
import { calendarEvents } from "@/lib/calendarEvents";
import { formatDate, formatDays } from "@/lib/calendar";
import { onePerEvent, photoCount } from "@/lib/photoPack";

type Props = { params: Promise<{ region: string }> };

export async function generateStaticParams() {
  return (await getRegions()).map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRegion((await params).region);
  return r ? { title: templesOf(r.name), description: r.introText } : {};
}

export default async function RegionPage({ params }: Props) {
  const region = await getRegion((await params).region);
  if (!region) notFound();

  // the temples listed on this page (a temple can be left off it in the admin)
  const temples = (await getTemples(region.id)).filter((t) => t.listed);
  // a temple's latest events, one photograph of each (newest first), and how
  // many photographs it has; stand-ins for a temple with none yet
  const latest = async (t: Temple) => {
    const own = await getPhotosForTemple(t.region, t.id);
    return own.length
      ? { t, photos: onePerEvent(own, 12), total: own.length, stand: false }
      : {
          t,
          photos: await getDummyPhotos(`latest-${t.id}`, 12),
          total: 24 + Math.floor(seeded(`count-${t.id}`)() * 100),
          stand: true,
        };
  };
  // each temple by its name, its proper name and its street alone, and a row of
  // its latest events
  const withPages = await Promise.all(temples.filter(hasPage).map(latest));
  const others = temples.filter((t) => !hasPage(t));

  // Temples outside the town live in their own region, "In and around <town>"
  // (address in-and-around-<town>), and are listed at the foot of the town's page.
  const around = await getRegion(`in-and-around-${region.id}`);
  const aroundTemples = around
    ? await Promise.all(
        (await getTemples(around.id))
          .filter((t) => t.listed && hasPage(t))
          .map(latest),
      )
    : [];
  // to the temple's own Photographs page (a temple in and around the town has
  // all its photographs on its page itself, at its foot; stand-ins, its page)
  const toPhotos = (t: Temple, total: number, stand: boolean) => ({
    href: isAround(t) || stand ? `/${t.region}/${t.id}#photographs` : `/${t.region}/${t.id}/photographs`,
    total,
    title: `All ${photoCount(total)} photographs of ${t.knownAs ?? t.name}`,
  });

  // Pondicherry's Hindu Ethos: the town's photo sets of that name, each a card
  const ethos = await getEthosSets(region.id);

  // today's date, as on the home page, for the box in the header
  const todayEvents = await calendarEvents(await getOccasions());

  return (
    <>
      <div className="wrap">
        {/* today's date and the way to the calendar, as on the home page: on a
            computer the same box, at the header's right; on a phone a small
            one beside the title */}
        <header className="page-head landing-head with-today">
          <div className="kicker">{region.name}</div>
          <h1 className="page-title">Temples</h1>
          <TodayTamil events={todayEvents} />
          <Html className="page-lede" html={region.intro} />
        </header>

        <section className="section temple-list">
          {/* each temple's name, and its photographs in line with it */}
          {withPages.map(({ t, photos, total, stand }) => (
            <div key={t.id} className="temple-entry">
              <TempleRow temple={t} formal />
              {/* its last photo, dimmed, counts the rest: a link to the temple's Photographs page */}
              {photos.length > 0 && (
                <PhotoWall
                  photos={photos}
                  layout="row"
                  note="Latest from this temple"
                  reveal
                  addressable={false}
                  moreLink={toPhotos(t, total, stand)}
                />
              )}
            </div>
          ))}
        </section>

        {others.length > 0 && (
          <section className="section tight">
            <h2 className="sub-head">Also being documented</h2>
            <p className="note-line">
              Each of these gets its own page once its first notes are ready.
            </p>
            {others.map((t) => (
              <TempleRowPlain key={t.id} temple={t} />
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
                {around.name} <span lang="ta">சுற்றுவட்டாரம்</span>
              </h2>
              {/* The region's Introduction (Admin → Regions), or this line if it is empty. */}
              <p className="note-line">
                {around.introText ||
                  `Temples outside ${region.name} that are part of this study.`}
              </p>
            </div>
            <div className="temple-cards">
              {aroundTemples.map(({ t, photos, total, stand }) => (
                <div key={t.id} className="temple-card">
                  <PhotoWall
                    photos={photos}
                    layout="row"
                    note="Latest from this temple"
                    reveal
                    addressable={false}
                    moreLink={toPhotos(t, total, stand)}
                  />
                  <TempleRow temple={t} formal />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pondicherry's Hindu Ethos: as the temples in and around it, past the
          wall's stripes, each a card, a row of its photographs (a press opens
          them, to go through them all) over its name and day. */}
      {ethos.length > 0 && (
        <section className="around ethos" id="hindu-ethos">
          <div className="stripes around-wall" aria-hidden="true" />
          <div className="wrap">
            <div className="around-head">
              <h2>{region.name}&apos;s Hindu Ethos</h2>
            </div>
            <div className="temple-cards">
              {ethos.map((e) => (
                <div key={e.id} className="temple-card">
                  <PhotoWall
                    photos={e.photos}
                    layout="row"
                    note={e.title}
                    addressable={false}
                    moreLink={{ total: e.photos.length, title: `All ${photoCount(e.photos.length)} photographs` }}
                    reveal
                  />
                  <div className="temple-row plain">
                    <div>
                      <div className="temple-name">{e.title}</div>
                      {e.dates.length > 0 && <div className="temple-sub">{formatDays(e.dates)}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
