/* Photos made ready in the browser before they are sent: shared by the
   admin's photo grids (components/admin/PhotoGrid, TaggedPhotoGrid) and
   Admin2's (components/edit/PhotoArranger). Each upright, at most 2400
   pixels long, the camera's time kept, credited Deepa for files named
   IMG…, else Arunaditya, the site's copyright in its details
   (lib/copyrightExif); the server makes its three smaller sizes. */

import { withCopyright } from "./copyrightExif";

const MAX = 2400;
export const AT_ONCE = 3;
// Deepa's camera runs this far ahead of Arunaditya's (scripts/import-photos)
const DEEPA_AHEAD_MS = 40 * 60 * 1000;
export const isDeepas = (name: string) => /^IMG/i.test(name);

export const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** When the camera says it was taken: the earliest time in the file's details, in Pondicherry's time. */
export async function takenAtOf(file: File): Promise<string | undefined> {
  const head = new TextDecoder("latin1").decode(await file.slice(0, 256 * 1024).arrayBuffer());
  const stamp = (head.match(/\d{4}:\d\d:\d\d \d\d:\d\d:\d\d/g) ?? []).filter((t) => !t.startsWith("0000")).sort()[0];
  if (!stamp) return undefined;
  const camera = new Date(`${stamp.slice(0, 10).replace(/:/g, "-")}T${stamp.slice(11)}+05:30`);
  if (isNaN(camera.getTime())) return undefined;
  return new Date(camera.getTime() - (isDeepas(file.name) ? DEEPA_AHEAD_MS : 0)).toISOString();
}

/** The photo upright, at most MAX pixels long, as a JPEG. */
export async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // under the website's 4.5 MB limit for what is sent to it
  for (const quality of [0.85, 0.78, 0.7]) {
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", quality));
    if (blob && blob.size < 4 * 1024 * 1024) return blob;
  }
  throw new Error("too large even made smaller");
}

export const minutes = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 1 ? "under a minute" : m === 1 ? "about a minute" : `about ${m} minutes`;
};

/** One photo made ready and sent to the photo library, with its tags and
    anything else given (its set, its day): its new entry's number. */
export async function uploadPhoto(file: File, stem: string, data: Record<string, unknown>): Promise<number> {
  const [blob, takenAt] = await Promise.all([shrink(file), takenAtOf(file)]);
  const form = new FormData();
  const name = `${stem}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.jpg`;
  const marked = withCopyright(new Uint8Array(await blob.arrayBuffer()), takenAt ? new Date(takenAt) : undefined);
  form.append("file", new File([marked as BlobPart], name, { type: "image/jpeg" }));
  form.append(
    "_payload",
    JSON.stringify({
      credit: isDeepas(file.name) ? "Photograph: Deepa" : "Photograph: Arunaditya",
      consent: "not-needed",
      alt: "",
      ...(takenAt ? { takenAt } : {}),
      ...data,
    }),
  );
  const res = await fetch("/api/media", { method: "POST", body: form, credentials: "include" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { errors?: { message?: string }[] };
    throw new Error(body.errors?.[0]?.message ?? res.statusText);
  }
  return ((await res.json()) as { doc: { id: number } }).doc.id;
}
