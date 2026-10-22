import sharp from 'sharp'

/** A drawing made ready for the site from the image uploaded (Drawings): cut
    to the drawing (the part of the sheet with ink on it), with the same
    margin all round, a twenty-fifth of its longer side; and its paper made
    clear, so the site's own off-white shows through, the ink kept as drawn
    (paler strokes partly clear). A PNG, at most 3000 pixels on its longer
    side. Null for an image with no drawing found on it. */
export async function prepareDrawing(file: Buffer): Promise<Buffer | null> {
  const base = sharp(file).rotate().flatten({ background: '#ffffff' }).removeAlpha()
  const meta = await base.clone().toBuffer({ resolveWithObject: true })
  const { width: W0, height: H0 } = meta.info
  // where the ink is, from a small grey copy: a row or column counts as drawn
  // where it has a few dark pixels (specks are left out); the outermost 2% of
  // the sheet is not looked at (a scanner's shadow at its edges)
  const small = await base.clone().greyscale().resize({ width: 600, withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = small.info
  const rows = new Array<number>(H).fill(0)
  const cols = new Array<number>(W).fill(0)
  const ex = Math.ceil(W * 0.02), ey = Math.ceil(H * 0.02)
  for (let y = ey; y < H - ey; y++)
    for (let x = ex; x < W - ex; x++)
      if (small.data[y * W + x] < 150) {
        rows[y]++
        cols[x]++
      }
  const span = (counts: number[], across: number) => {
    const min = Math.max(2, Math.round(across * 0.004))
    const first = counts.findIndex((c) => c >= min)
    if (first < 0) return null
    let last = counts.length - 1
    while (counts[last] < min) last--
    return [first, last + 1] as const
  }
  const ys = span(rows, W)
  const xs = span(cols, H)
  if (!ys || !xs) return null
  // back to the full image, a pixel of the small copy each way to spare
  const k = W0 / W
  const left = Math.max(0, Math.floor((xs[0] - 1) * k))
  const top = Math.max(0, Math.floor((ys[0] - 1) * k))
  const width = Math.min(W0, Math.ceil((xs[1] + 1) * k)) - left
  const height = Math.min(H0, Math.ceil((ys[1] + 1) * k)) - top
  const cut = await base.clone().extract({ left, top, width, height }).raw().toBuffer({ resolveWithObject: true })
  const px = cut.data
  const n = cut.info.width * cut.info.height
  // the paper's tone: the lightest tenth of the drawing's area
  const tones = new Uint32Array(256)
  for (let i = 0; i < n; i++) tones[Math.round(0.299 * px[i * 3] + 0.587 * px[i * 3 + 1] + 0.114 * px[i * 3 + 2])]++
  let paper = 255
  for (let seen = 0; paper > 0 && seen < n * 0.1; paper--) seen += tones[paper]
  // clear where it is as light as the paper; whole where it is ink
  const clear = paper - 14
  const ink = Math.max(0, paper * 0.5)
  const out = Buffer.alloc(n * 4)
  for (let i = 0; i < n; i++) {
    const r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2]
    const L = 0.299 * r + 0.587 * g + 0.114 * b
    const a = Math.min(1, Math.max(0, (clear - L) / (clear - ink)))
    // the ink's own colour, without the paper showing through it
    const un = (c: number) => (a > 0.02 ? Math.min(255, Math.max(0, Math.round((c - (1 - a) * paper) / a))) : 0)
    out[i * 4] = un(r)
    out[i * 4 + 1] = un(g)
    out[i * 4 + 2] = un(b)
    out[i * 4 + 3] = Math.round(a * 255)
  }
  const margin = Math.round(Math.max(cut.info.width, cut.info.height) / 25)
  let img = sharp(out, { raw: { width: cut.info.width, height: cut.info.height, channels: 4 } }).extend({
    top: margin,
    bottom: margin,
    left: margin,
    right: margin,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  const longer = Math.max(cut.info.width, cut.info.height) + 2 * margin
  if (longer > 3000) img = sharp(await img.png().toBuffer()).resize({ width: Math.round(((cut.info.width + 2 * margin) * 3000) / longer) })
  return img.png({ compressionLevel: 9 }).toBuffer()
}
