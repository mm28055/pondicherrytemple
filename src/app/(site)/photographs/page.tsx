import type { Metadata } from "next";
import { getPhotoFilters, getPhotos } from "@/lib/data";
import { PhotoWall } from "@/components/PhotoWall";

export const metadata: Metadata = {
  title: "Photographs",
  description: "Every photograph on Sthalam, from every temple and festival.",
};

/** Every photograph, newest first, which can be narrowed by temple,
    festival and year. (To be designed.) */
export default async function PhotographsPage() {
  const photos = [...(await getPhotos())].sort((a, b) => b.date.localeCompare(a.date));
  const filters = await getPhotoFilters(photos, ["temples", "observances", "years"]);

  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="page-title">Photographs</h1>
      </header>
      <section className="section">
        <PhotoWall photos={photos} layout="all" filters={filters} />
      </section>
    </div>
  );
}
