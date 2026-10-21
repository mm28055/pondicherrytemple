import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDummyPhotos,
  getOccasions,
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
  // a temple's latest photographs and how many it has (stand-ins for now; see below)
  const latest = async (t: Temple) => ({
    t,
    photos: await getDummyPhotos(`latest-${t.id}`, 12),
    total: 24 + Math.floor(seeded(`count-${t.id}`)() * 100),
  });
  // each temple by its name, its proper name and its street alone, and a row of
  // its latest photographs. For now, stand-ins for every temple; when the real
  // ones are to show, its own newest first:
  //   [...(await getPhotosForTemple(region.id, t.id))].sort((a, b) => b.date.localeCompare(a.date))
  // (and its total, for the row's last photo to count the rest, will be
  // (await getPhotosForTemple(region.id, t.id)).length)
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
  const toPhotos = (t: Temple, total: number) => ({
    href: `/${t.region}/${t.id}#photographs`,
    total,
    title: `All ${total.toLocaleString("en-IN")} photographs of ${t.knownAs ?? t.name}`,
  });

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
          {withPages.map(({ t, photos, total }) => (
            <div key={t.id} className="temple-entry">
              <TempleRow temple={t} formal />
              {/* its last photo, dimmed, counts the rest: a link to the Photographs on the temple's page */}
              {photos.length > 0 && (
                <PhotoWall
                  photos={photos}
                  layout="row"
                  note="Latest from this temple"
                  addressable={false}
                  moreLink={toPhotos(t, total)}
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
              {aroundTemples.map(({ t, photos, total }) => (
                <div key={t.id} className="temple-card">
                  <PhotoWall
                    photos={photos}
                    layout="row"
                    note="Latest from this temple"
                    addressable={false}
                    moreLink={toPhotos(t, total)}
                  />
                  <TempleRow temple={t} formal />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
