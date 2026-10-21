import type { Metadata } from "next";
import {
  countTemplesForObservance,
  getObservances,
  getOccasionsForObservance,
  getPhotosForObservance,
  getSectionIntro,
} from "@/lib/data";
import { observanceRow } from "@/lib/view";
import { seesFestivalPages } from "@/lib/festivals-access";
import { ObservanceGallery } from "@/components/ObservanceGallery";

export const metadata: Metadata = {
  title: "Festivals & Rituals",
  description:
    "The festivals and rituals of the temples — each explained once, with every field note and article about it.",
};

// Whether the cards open their pages is decided on each visit (signed in, or not).
export const dynamic = "force-dynamic";

/** The festivals and rituals, led by their photographs, for everyone. Until
    their own pages are published (lib/festivals), only someone signed in to
    the admin can open them; to the public the same cards are not links, and
    the introduction ends "(coming soon)" (?as=public shows a team member that version). */
export default async function ObservancesPage({ searchParams }: { searchParams: Promise<{ as?: string }> }) {
  const { as } = await searchParams;
  const all = await Promise.all(
    (await getObservances()).map(async (o) => {
      // its photograph: one marked featured, if any; else the first
      const photos = await getPhotosForObservance(o.id);
      const p = photos.find((x) => x.featured) ?? photos[0];
      return {
        o,
        row: observanceRow(o, await countTemplesForObservance(o.id)),
        seen: (await getOccasionsForObservance(o.id)).length,
        photo: p ? { src: p.medium, alt: p.alt, focus: p.focus } : undefined,
      };
    })
  );
  const intro = await getSectionIntro("observances");
  const linked = await seesFestivalPages(as === "public");

  // The page: the most seen leads, the rest, festivals and
  // rituals together, A to Z, led by their photographs
  const sorted = all.sort((a, b) => b.seen - a.seen || a.o.name.localeCompare(b.o.name));
  const items = sorted.map(({ o, row, photo }) => ({ row, kind: o.kind, photo }));
  const [lead, ...rest] = items;
  rest.sort((x, y) => x.row.name.localeCompare(y.row.name));

  return (
    <div className="wrap">
      <ObservanceGallery
        lead={lead}
        items={rest}
        linked={linked}
        head={
          <>
            <div className="kicker">The ritual year</div>
            <h1 className="page-title">Festivals &amp; Rituals</h1>
            <p className="page-lede">
              {intro}
              {!linked && <span className="reserved-soon"> (coming soon)</span>}
            </p>
          </>
        }
      />
    </div>
  );
}
