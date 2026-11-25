import { notFound } from "next/navigation";
import { EditPhotos } from "@/components/edit/EditPhotos";
import { BackLink } from "@/components/BackLink";
import { PhotoWall } from "@/components/PhotoWall";
import { templeShortTa, templeTa } from "@/content/homeTa";
import { getObservances, getPhotoFilters, getPhotosForTemple, getRegion, getRegions, getTemple, getTemples, hasPage } from "@/lib/data";
import { packPhotos } from "@/lib/photoPack";
import { titleFit } from "@/lib/titleFit";
import { filtersTa, photosTa } from "@/lib/viewTa";

/** Every photograph of a temple, which can be narrowed by festival and year.
    In Tamil (`ta`), under /ta: its name, and each photo's festival and occasion. */
export async function TemplePhotosView({ regionId, templeId, ta = false }: { regionId: string; templeId: string; ta?: boolean }) {
  const region = await getRegion(regionId);
  const t = await getTemple(regionId, templeId);
  if (!region || !t || !hasPage(t)) notFound();
  const own = await getPhotosForTemple(region.id, t.id);
  if (!own.length) notFound();

  const english = await getPhotoFilters(own, ["observances", "years"]);
  const temples = ta ? (await Promise.all((await getRegions()).map((r) => getTemples(r.id)))).flat() : [];
  const observances = ta ? await getObservances() : [];
  const photos = ta ? photosTa(own, temples, observances) : own;
  const filters = ta ? filtersTa(english, temples, observances) : english;
  const name = t.knownAs ?? t.name;
  const short = t.shortName ?? name;
  const title = ta ? templeTa(t.id, name) : name;

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      {!ta && <EditPhotos kind="temples" slug={t.id} label={name} />}
      <header className="page-head">
        <BackLink className="crumb" href={`${ta ? "/ta" : ""}/${region.id}/${t.id}`}>
          ← {title}
        </BackLink>
        <h1 className="temple-title" style={titleFit(title)}>{title}</h1>
      </header>
      <section className="section">
        <PhotoWall pack={packPhotos(photos)} layout="all" filters={filters} heads={{ here: ta ? templeShortTa(t.id, short) : short }} ta={ta} />
      </section>
    </div>
  );
}
