/* Reading an MP4 video's header without the whole file: whether it is there at
   all, and how its picture is encoded. H.264 ("avc1") plays in every browser;
   HEVC ("hvc1"/"hev1", an iPhone's default) only in some. Used to refuse HEVC
   uploads (payload/collections/Media.ts) and to check that the morning
   Instagram import's videos really reached storage (instagram/import.ts). */

export type VideoCheck = {
  /** whether the file could be had */
  found: boolean;
  /** its size in bytes, when found */
  size?: number;
  /** the video codecs named in its index: "avc1", "hvc1", … */
  codecs: string[];
};

const CODECS = ["avc1", "avc3", "hvc1", "hev1", "av01", "vp09", "mp4v"];

/** The codecs named in an MP4 index ("moov" box) held in `bytes`. */
function codecsIn(bytes: Uint8Array): string[] {
  const text = Buffer.from(bytes).toString("latin1");
  return CODECS.filter((c) => text.includes(c));
}

/** Whether a video is HEVC, which many browsers cannot play. */
export const isHevc = (c: VideoCheck | string[]) => (Array.isArray(c) ? c : c.codecs).some((x) => x === "hvc1" || x === "hev1");

/** An MP4 already in memory (an upload the server sees): its index's codecs. */
export function checkVideoBytes(bytes: Uint8Array): VideoCheck {
  const buf = Buffer.from(bytes);
  // walk the top-level boxes to the index, wherever it is in the file
  for (let off = 0; off + 8 <= buf.length; ) {
    let size = buf.readUInt32BE(off);
    const name = buf.toString("latin1", off + 4, off + 8);
    if (size === 1 && off + 16 <= buf.length) size = Number(buf.readBigUInt64BE(off + 8));
    else if (size === 0) size = buf.length - off;
    if (size < 8) break;
    if (name === "moov") return { found: true, size: buf.length, codecs: codecsIn(buf.subarray(off, off + size)) };
    off += size;
  }
  return { found: true, size: buf.length, codecs: [] };
}

/** An MP4 at an address (in storage): fetched a few bytes at a time, never whole. */
export async function checkVideoAt(url: string): Promise<VideoCheck> {
  const range = async (start: number, length: number) => {
    const res = await fetch(url, { headers: { Range: `bytes=${start}-${start + length - 1}` }, cache: "no-store" });
    if (res.status !== 206 && res.status !== 200) return null;
    const total = Number((res.headers.get("content-range") ?? "").split("/")[1]) || Number(res.headers.get("content-length")) || 0;
    const type = res.headers.get("content-type") ?? "";
    return { total, type, bytes: new Uint8Array(await res.arrayBuffer()) };
  };
  const first = await range(0, 16);
  if (!first || first.type.startsWith("text/html")) return { found: false, codecs: [] };
  const total = first.total;
  for (let off = 0, guard = 0; off < total && guard < 40; guard++) {
    const head = off === 0 ? first : await range(off, 16);
    if (!head || head.bytes.length < 8) break;
    const buf = Buffer.from(head.bytes);
    let size = buf.readUInt32BE(0);
    const name = buf.toString("latin1", 4, 8);
    if (size === 1 && buf.length >= 16) size = Number(buf.readBigUInt64BE(8));
    else if (size === 0) size = total - off;
    if (size < 8) break;
    if (name === "moov") {
      const index = await range(off, Math.min(size, 4_000_000));
      return { found: true, size: total, codecs: index ? codecsIn(index.bytes) : [] };
    }
    off += size;
  }
  return { found: true, size: total, codecs: [] };
}

/** What to tell someone whose upload is HEVC. */
export const HEVC_MESSAGE =
  "This video is in HEVC (H.265), an iPhone's usual format, which many browsers cannot play. Export it as H.264 (MP4) and upload it again: in HandBrake, the “Fast 1080p30” preset with “Web Optimized” ticked; on an iPhone, Settings → Camera → Formats → “Most Compatible”.";
