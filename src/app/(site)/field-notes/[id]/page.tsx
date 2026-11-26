import type { Metadata } from "next";
import { NoteView } from "@/components/NoteView";
import { formatDate } from "@/lib/calendar";
import { getFieldNote, getFieldNotes, getPhotosForNote } from "@/lib/data";
import { shareMeta, sharePicture } from "@/lib/share";

type Props = { params: Promise<{ id: string }> };

// Notes published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getFieldNotes()).map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getFieldNote((await params).id);
  // shared with the first of its photographs
  return n
    ? shareMeta({ title: n.title, description: `${formatDate(n.date)} · ${n.occasion}`, image: sharePicture((await getPhotosForNote(n.id))[0]) })
    : {};
}

/** A field note (components/NoteView). */
export default async function FieldNotePage({ params }: Props) {
  return <NoteView id={(await params).id} />;
}
