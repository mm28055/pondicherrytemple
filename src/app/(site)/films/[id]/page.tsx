import { shareMeta, sharePicture } from "@/lib/share";
import type { Metadata } from "next";
import { FilmView } from "@/components/FilmView";
import { getFilm, getFilms } from "@/lib/data";
import { formatDate } from "@/lib/calendar";

type Props = { params: Promise<{ id: string }> };

// Films published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getFilms()).map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFilm((await params).id);
  // shared with its still
  return f ? shareMeta({ title: f.title, description: f.excerpt || formatDate(f.date), image: sharePicture({ src: f.video.poster }) }) : {};
}

/** A film's own page (components/FilmView). In Tamil: /ta/films/…. */
export default async function FilmPage({ params }: Props) {
  return <FilmView id={(await params).id} />;
}
