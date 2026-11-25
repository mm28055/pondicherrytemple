import type { Metadata } from "next";
import { FilmView } from "@/components/FilmView";
import { titleTa } from "@/content/notesTa";
import { getFilm, getFilms } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getFilms()).map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFilm((await params).id);
  return f ? { title: { absolute: `${titleTa(f.id, f.title)} — ஸ்தலம்` } } : {};
}

/** A film's own page in Tamil. */
export default async function FilmPageTamil({ params }: Props) {
  return <FilmView id={(await params).id} ta />;
}
