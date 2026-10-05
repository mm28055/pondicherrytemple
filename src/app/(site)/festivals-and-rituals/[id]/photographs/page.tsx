import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getObservance, getPhotoFilters, getPhotosForObservance } from "@/lib/data";
import { PhotoWall } from "@/components/PhotoWall";
import { seesFestivalPages } from "@/lib/festivals-access";

type Props = { params: Promise<{ id: string }> };

// Held in reserve until published (lib/festivals): shown only to someone
// signed in to the admin, so decided on each visit, not built ahead.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = await getObservance((await params).id);
  return o ? { title: `${o.name}: photographs` } : {};
}

/** Every photograph of a festival or ritual, which can be narrowed by
    temple, deity and year. */
export default async function ObservancePhotosPage({ params }: Props) {
  const o = await getObservance((await params).id);
  if (!(await seesFestivalPages())) notFound();
  if (!o) notFound();
  const photos = await getPhotosForObservance(o.id);
  if (!photos.length) notFound();
  const filters = await getPhotoFilters(photos, ["temples", "deities", "years"]);

  return (
    <div className="wrap">
      <header className="page-head">
        <Link className="crumb" href={`/festivals-and-rituals/${o.id}`}>
          ← {o.name}
        </Link>
        <div className="kicker">
          Photographs · {photos.length}
        </div>
        {o.tamil && (
          <p className="tamil-title" lang="ta">
            {o.tamil}
          </p>
        )}
        <h1 className="name-title">{o.name}</h1>
      </header>
      <section className="section">
        <PhotoWall photos={photos} layout="all" filters={filters} />
      </section>
    </div>
  );
}
