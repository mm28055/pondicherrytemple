import type { Metadata } from "next";
import { NoteView } from "@/components/NoteView";
import { titleTa } from "@/content/notesTa";
import { getFieldNote, getFieldNotes } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

// Notes published later get their page on the first visit.
export async function generateStaticParams() {
  return (await getFieldNotes()).map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getFieldNote((await params).id);
  return n ? { title: { absolute: `${titleTa(n.id, n.title)} — ஸ்தலம்` } } : {};
}

/** A field note in Tamil (components/NoteView). */
export default async function FieldNotePageTamil({ params }: Props) {
  return <NoteView id={(await params).id} ta />;
}
