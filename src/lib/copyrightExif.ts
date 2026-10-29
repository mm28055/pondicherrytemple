/* The site's copyright, written into a photograph's own details (its EXIF),
   so it goes with every copy of the file, saved or downloaded, though no one
   sees it on the page. Written without touching the picture itself (the
   JPEG's image data is kept byte for byte): a block of details put in after
   the file's start, in place of any it had. With it, the camera's time (in
   Pondicherry's time, as cameras write it), so that is kept too.
   Used by the admin's photo grid as it uploads (components/admin/PhotoGrid);
   the server keeps it in the three smaller sizes (collections/Media,
   withMetadata). */

export const COPYRIGHT = "Copyright Sthalam, The Temple Documentation Project. All rights reserved.";

/** Whether a file's details carry the site's copyright. */
export const hasCopyright = (head: Uint8Array) => new TextDecoder("latin1").decode(head).includes(COPYRIGHT);

const ascii = (s: string) => {
  const out = new Uint8Array(s.length + 1);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0x7f;
  return out;
};

type Entry = { tag: number; type: 2 | 4; value: Uint8Array | number };

/** A TIFF block (big-endian) of an IFD0 and, if given, an Exif IFD. */
function tiff(ifd0: Entry[], exif: Entry[]): Uint8Array {
  const all = exif.length ? [...ifd0, { tag: 0x8769, type: 4 as const, value: 0 }].sort((a, b) => a.tag - b.tag) : ifd0;
  const ifdSize = (n: number) => 2 + n * 12 + 4;
  const exifAt = 8 + ifdSize(all.length);
  let dataAt = exifAt + (exif.length ? ifdSize(exif.length) : 0);
  const blobs: { at: number; bytes: Uint8Array }[] = [];
  const size = dataAt + [...all, ...exif].reduce((n, e) => n + (e.value instanceof Uint8Array && e.value.length > 4 ? e.value.length + (e.value.length % 2) : 0), 0);
  const buf = new Uint8Array(size);
  const view = new DataView(buf.buffer);
  buf.set([0x4d, 0x4d, 0x00, 0x2a], 0);
  view.setUint32(4, 8);
  const write = (at: number, entries: Entry[]) => {
    view.setUint16(at, entries.length);
    entries.forEach((e, i) => {
      const p = at + 2 + i * 12;
      view.setUint16(p, e.tag);
      view.setUint16(p + 2, e.type);
      if (e.tag === 0x8769) {
        view.setUint32(p + 4, 1);
        view.setUint32(p + 8, exifAt);
      } else if (e.value instanceof Uint8Array) {
        view.setUint32(p + 4, e.value.length);
        if (e.value.length <= 4) buf.set(e.value, p + 8);
        else {
          view.setUint32(p + 8, dataAt);
          blobs.push({ at: dataAt, bytes: e.value });
          dataAt += e.value.length + (e.value.length % 2);
        }
      } else {
        view.setUint32(p + 4, 1);
        view.setUint32(p + 8, e.value);
      }
    });
    view.setUint32(at + 2 + entries.length * 12, 0);
  };
  write(8, all);
  if (exif.length) write(exifAt, exif);
  for (const b of blobs) buf.set(b.bytes, b.at);
  return buf;
}

/** The time as cameras write it, in Pondicherry's time: "2026:08:12 06:46:05". */
const cameraTime = (d: Date) => new Date(d.getTime() + 5.5 * 3600e3).toISOString().slice(0, 19).replace("T", " ").replace(/-/g, ":");

/** The JPEG with the site's copyright (and the time it was taken) in its details, in place of any it had. */
export function withCopyright(jpeg: Uint8Array, taken?: Date): Uint8Array {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return jpeg;
  const time = taken && !isNaN(taken.getTime()) ? ascii(cameraTime(taken)) : undefined;
  const block = tiff(
    [
      ...(time ? [{ tag: 0x0132, type: 2 as const, value: time }] : []),
      { tag: 0x8298, type: 2, value: ascii(COPYRIGHT) },
    ],
    time
      ? [
          { tag: 0x9003, type: 2, value: time },
          { tag: 0x9004, type: 2, value: time },
        ]
      : []
  );
  const app1 = new Uint8Array(4 + 6 + block.length);
  app1.set([0xff, 0xe1, ((app1.length - 2) >> 8) & 0xff, (app1.length - 2) & 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0], 0);
  app1.set(block, 10);
  // the file's own segments before its image data: a JFIF (APP0) kept first, any old details (APP1 Exif) left out
  const keep: Uint8Array[] = [jpeg.subarray(0, 2)];
  let p = 2;
  let placed = false;
  while (p + 4 <= jpeg.length && jpeg[p] === 0xff) {
    const marker = jpeg[p + 1];
    if (marker === 0xda || marker === 0xd9) break; // the image data begins
    const len = (jpeg[p + 2] << 8) | jpeg[p + 3];
    const seg = jpeg.subarray(p, p + 2 + len);
    const isExif = marker === 0xe1 && seg[4] === 0x45 && seg[5] === 0x78 && seg[6] === 0x69 && seg[7] === 0x66;
    if (!placed && marker !== 0xe0) {
      keep.push(app1);
      placed = true;
    }
    if (!isExif) keep.push(seg);
    p += 2 + len;
  }
  if (!placed) keep.push(app1);
  keep.push(jpeg.subarray(p));
  const out = new Uint8Array(keep.reduce((n, k) => n + k.length, 0));
  let at = 0;
  for (const k of keep) {
    out.set(k, at);
    at += k.length;
  }
  return out;
}
