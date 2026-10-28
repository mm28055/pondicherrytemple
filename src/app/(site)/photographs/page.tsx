import Link from "next/link";
import type { Metadata } from "next";
import { getPhotoFilters, getPhotos } from "@/lib/data";
import { PhotoWall } from "@/components/PhotoWall";
import { packPhotos } from "@/lib/photoPack";

export const metadata: Metadata = {
  title: "Photographs",
  description: "Every photograph on Sthalam, from every temple and festival.",
};

/** Every photograph, newest first, which can be narrowed by temple,
    festival and year. (To be designed.) In the menu, under Field Notes. */
export default async function PhotographsPage() {
  // newest first (as they come: a day's photos in the order taken)
  const photos = await getPhotos();
  const filters = await getPhotoFilters(photos, ["temples", "observances", "years"]);

  return (
    <div className="wrap">
      <header className="page-head landing-head">
        <Link className="crumb" href="/field-notes">
          ← Field notes
        </Link>
        <h1 className="page-title">Photographs</h1>
      </header>
      <section className="section">
        <PhotoWall pack={packPhotos(photos)} layout="all" filters={filters} heads={{ temple: true, note: true }} />
      </section>
    </div>
  );
}
