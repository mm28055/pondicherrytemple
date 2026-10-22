import sharp from 'sharp'

/** A drawing made ready for the site from the image uploaded (Drawings): cut
    to the drawing (the part of the sheet with ink on it), with the same
    margin all round, a twenty-fifth of its longer side; and its paper made
    clear, so the site's own off-white shows through, the ink kept as drawn
    (paler strokes partly clear). The paper is judged where it is, not as
    one tone: a photographed sheet, lit unevenly or with a colour cast (a
    shadow, a bluish corner), is evened out first, so all of it clears.
    `cut` false: the whole image as uploaded, its paper made clear, nothing
    cut away and no margin added. A PNG, at most 3000 pixels on its longer
    side. Null for an image with no drawing found on it. */
export async function prepareDrawing(file: Buffer, { cut: cutTo = true }: { cut?: boolean } = {}): Promise<Buffer | null> {
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
  const found = { ys: span(rows, W), xs: span(cols, H) }
  if (!found.ys || !found.xs) return null
  // the whole image, where it is not to be cut
  const ys = cutTo ? found.ys : ([0, H] as const)
  const xs = cutTo ? found.xs : ([0, W] as const)
  // back to the full image, a pixel of the small copy each way to spare
  const k = W0 / W
  const left = Math.max(0, Math.floor((xs[0] - 1) * k))
  const top = Math.max(0, Math.floor((ys[0] - 1) * k))
  const width = Math.min(W0, Math.ceil((xs[1] + 1) * k)) - left
  const height = Math.min(H0, Math.ceil((ys[1] + 1) * k)) - top
  const cut = await base.clone().extract({ left, top, width, height }).raw().toBuffer({ resolveWithObject: true })
  const px = cut.data
  const cw = cut.info.width, ch = cut.info.height
  const n = cw * ch
  // the paper's colour at each place: from a small copy, each pixel the
  // lightest round it (so the ink's strokes are passed over), then softened,
  // then brought back up to full size
  const sw = Math.max(8, Math.round(cw / 12)), sh = Math.max(8, Math.round(ch / 12))
  const lo = await sharp(px, { raw: { width: cw, height: ch, channels: 3 } }).resize(sw, sh, { kernel: 'cubic' }).raw().toBuffer()
  const lightest = Buffer.alloc(lo.length)
  const R = 2
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++)
      for (let c = 0; c < 3; c++) {
        let m = 0
        for (let dy = -R; dy <= R; dy++)
          for (let dx = -R; dx <= R; dx++) {
            const yy = Math.min(sh - 1, Math.max(0, y + dy)), xx = Math.min(sw - 1, Math.max(0, x + dx))
            m = Math.max(m, lo[(yy * sw + xx) * 3 + c])
          }
        lightest[(y * sw + x) * 3 + c] = m
      }
  const paper = await sharp(lightest, { raw: { width: sw, height: sh, channels: 3 } }).blur(1.5).resize(cw, ch, { kernel: 'cubic' }).raw().toBuffer()
  const out = Buffer.alloc(n * 4)
  for (let i = 0; i < n; i++) {
    // each colour as a share of the paper's there: the paper becomes white
    const r = Math.min(255, (px[i * 3] * 255) / Math.max(40, paper[i * 3]))
    const g = Math.min(255, (px[i * 3 + 1] * 255) / Math.max(40, paper[i * 3 + 1]))
    const b = Math.min(255, (px[i * 3 + 2] * 255) / Math.max(40, paper[i * 3 + 2]))
    const L = 0.299 * r + 0.587 * g + 0.114 * b
    // clear where it is as light as the paper; whole where it is ink
    const a = Math.min(1, Math.max(0, (238 - L) / (238 - 120)))
    // the ink's own colour, without the paper showing through it; at a
    // stroke's faint edge, grey rather than a tint (a photograph's fringes)
    const un = (c: number) => (a > 0.02 ? Math.min(255, Math.max(0, (c - (1 - a) * 255) / a)) : 0)
    const grey = un(L)
    const tone = (c: number) => Math.round(grey + (un(c) - grey) * a)
    out[i * 4] = tone(r)
    out[i * 4 + 1] = tone(g)
    out[i * 4 + 2] = tone(b)
    out[i * 4 + 3] = Math.round(a * 255)
  }
  const margin = cutTo ? Math.round(Math.max(cut.info.width, cut.info.height) / 25) : 0
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
