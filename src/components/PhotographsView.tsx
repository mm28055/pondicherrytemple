import { BackLink } from "@/components/BackLink";
import { getObservances, getPhotoFilters, getPhotos, getRegions, getTemples } from "@/lib/data";
import { PHOTOGRAPHS_TA } from "@/content/aboutTa";
import { filtersTa, photosTa } from "@/lib/viewTa";
import { PhotoWall } from "@/components/PhotoWall";
import { packPhotos } from "@/lib/photoPack";

/** Every photograph, newest first, which can be narrowed by temple,
    festival and year. (To be designed.) In the menu, under Field Notes. */
export async function PhotographsView({ ta = false }: { ta?: boolean }) {
  // in Tamil (/ta/photographs): its headings, and each photo's temples and occasion
  const T = ta ? PHOTOGRAPHS_TA : null;
  const temples = ta ? (await Promise.all((await getRegions()).map((r) => getTemples(r.id)))).flat() : [];
  const observances = ta ? await getObservances() : [];
  // newest first (as they come: a day's photos in the order taken)
  const own = await getPhotos();
  const english = await getPhotoFilters(own, ["temples", "observances", "years"]);
  const photos = ta ? photosTa(own, temples, observances) : own;
  const filters = ta ? filtersTa(english, temples, observances) : english;

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <header className="page-head landing-head">
        <BackLink className="crumb" href={ta ? "/ta/field-notes" : "/field-notes"}>
          ← {T?.back ?? "Field notes"}
        </BackLink>
        <h1 className="page-title">{T?.title ?? "Photographs"}</h1>
      </header>
      <section className="section">
        <PhotoWall pack={packPhotos(photos)} layout="all" filters={filters} heads={{ temple: true, note: true }} ta={ta} />
      </section>
    </div>
  );
}
