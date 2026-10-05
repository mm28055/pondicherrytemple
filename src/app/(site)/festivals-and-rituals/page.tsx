import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  countTemplesForObservance,
  getObservances,
  getOccasionsForObservance,
  getPhotosForObservance,
  getSectionIntro,
} from "@/lib/data";
import { observanceRow } from "@/lib/view";
import { seesFestivalPages } from "@/lib/festivals-access";
import { seeded } from "@/lib/mahotsavam";
import { ObservanceGallery } from "@/components/ObservanceGallery";

export const metadata: Metadata = {
  title: "Festivals & Rituals",
  description:
    "The festivals and rituals of the temples — each explained once, with every field note and article about it.",
};

// Who sees which version is decided on each visit (signed in, or not).
export const dynamic = "force-dynamic";

/** The festivals and rituals. Until their pages are published (lib/festivals),
    the public sees a cloud of their names; someone
    signed in to the admin sees the page being prepared, led by photographs
    (?as=public shows them the public one). */
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
  if (!(await seesFestivalPages(as === "public"))) return <Cloud all={all} />;

  // The page being prepared: the most seen leads, the rest, festivals and
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
        head={
          <>
            <div className="kicker">The ritual year</div>
            <h1 className="page-title">Festivals &amp; Rituals</h1>
            <p className="page-lede">{intro}</p>
          </>
        }
      />
    </div>
  );
}

/** The public page, until the festivals' own pages are ready: a cloud of
    their names in Tamil, each with its English name small beneath, the more
    often seen the larger; the introduction points to the field notes. */
async function Cloud({ all }: { all: { o: { id: string; name: string; tamil?: string; kind: string }; seen: number }[] }) {
  // scattered, but always the same way
  const r = seeded("festivals cloud");
  const most = Math.max(1, ...all.map((x) => x.seen));
  // its size, from 0 to 1: mostly by how often it was seen (eased, so a few
  // much-seen ones do not leave the rest all small), with a little chance in it
  const names = [...all]
    .map((x) => ({ ...x, k: r(), w: Math.min(1, Math.sqrt(x.seen / most) * 0.7 + r() * 0.45) }))
    .sort((a, b) => a.k - b.k);


  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">The ritual year</div>
        <h1 className="page-title">Festivals &amp; Rituals</h1>
        <p className="page-lede">
          The festivals we were present for. Each is explained, and gathers every field note and article about
          it, from every temple where it was seen. The section will be published once it is complete. In the
          meantime, follow our journey through our{" "}
          <Link className="lede-link" href="/field-notes">
            field notes
          </Link>
        </p>
      </header>

      <section className="section">
        <ul className="name-cloud" aria-label="The festivals and rituals">
          {names.map(({ o, w }) => (
            <li
              key={o.id}
              className={`cloud-name ${o.kind}`}
              // the more often seen, the larger: from 0 to 1
              style={{ "--w": w } as CSSProperties}
            >
              <span className="cloud-ta" lang="ta">
                {o.tamil ?? o.name}
              </span>
              {o.tamil && <span className="cloud-en">{o.name}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
