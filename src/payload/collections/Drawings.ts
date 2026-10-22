import fs from 'fs/promises'
import path from 'path'
import type { CollectionBeforeChangeHook, CollectionConfig, PayloadRequest } from 'payload'
import { prepareDrawing } from '../../lib/drawingImage'
import { canCreateContent, canUpdateContent, isEditor, publishedOrTeam } from '../access'
import {
  createdByField,
  observancesField,
  regionField,
  reviewField,
  templesField,
} from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'

const idOf = (v: unknown) => (typeof v === 'object' && v ? (v as { id: number }).id : (v as number | null | undefined)) ?? null

/** An uploaded file's contents, where it is kept: on this laptop (MEDIA_DIR), or in R2. */
async function fileOf(media: { filename?: string | null; url?: string | null; prefix?: string | null }): Promise<Buffer | null> {
  if (!media.filename) return null
  const local = await fs
    .readFile(path.join(process.env.MEDIA_DIR || path.resolve(process.cwd(), '.data/media'), media.filename))
    .catch(() => null)
  if (local) return local
  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
  const url = media.url?.startsWith('http')
    ? media.url
    : base
      ? `${base}/${media.prefix ? `${media.prefix}/` : ''}${encodeURIComponent(media.filename)}`
      : ''
  if (!url) return null
  const res = await fetch(url)
  return res.ok ? Buffer.from(await res.arrayBuffer()) : null
}

/** The copy of a drawing the site shows (lib/drawingImage: cut to the
    drawing, the same margin all round, its paper made clear), made from the
    image uploaded and saved as a file of its own; the upload itself is kept
    as it is. Null where there is none to make (no drawing found, or a
    placeholder). Exported for the migration that makes it for the drawings
    already there. */
export async function makeShownCopy(req: PayloadRequest, imageId: number, title: string, cut = true): Promise<number | null> {
  const media = await req.payload.findByID({ collection: 'media', id: imageId, depth: 0, req, overrideAccess: true })
  const type = String(media?.mimeType ?? '')
  if (!media || !type.startsWith('image/') || type === 'image/svg+xml') return null
  const file = await fileOf(media)
  const png = file && (await prepareDrawing(file, { cut }))
  if (!png) return null
  const name = `${(media.filename ?? 'drawing').replace(/\.[^.]+$/, '')} (on the site).png`
  const copy = await req.payload.create({
    collection: 'media',
    data: { alt: media.alt || title, credit: media.credit ?? undefined, consent: media.consent ?? undefined },
    file: { data: png, mimetype: 'image/png', name, size: png.length },
    req,
    overrideAccess: true,
    context: { ...req.context, skipRevalidate: true },
  })
  return copy.id as number
}

/* Made again whenever the drawing's image changes, or "Cut to the drawing"
   does (the copy before it removed), or when it has none yet. A file that cannot be read just now
   leaves the drawing shown as uploaded, until it is next saved. */
const makeShown: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const image = idOf(data?.image)
  if (!image) return data
  const cut = data.cut !== false
  const changed = image !== idOf(originalDoc?.image) || cut !== (originalDoc?.cut !== false)
  if (!changed && idOf(data.shown)) return data
  try {
    const shown = await makeShownCopy(req, image, data.title ?? '', cut)
    const before = idOf(originalDoc?.shown)
    if (before && before !== shown)
      await req.payload.delete({ collection: 'media', id: before, req, overrideAccess: true, context: { ...req.context, skipRevalidate: true } }).catch(() => null)
    return { ...data, shown }
  } catch {
    return data
  }
}

export const Drawings: CollectionConfig = {
  slug: 'drawings',
  labels: { singular: 'Drawing', plural: 'Drawings' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'image', '_status'],
    description:
      "Abishek's drawings: each temple's illustrated plan (its layout), and scenes photographs can't capture. A temple can have several layouts: each drawing of the temple's plan tagged with it joins the stack in the header of its page, in the order set below. Scenes appear on every temple and festival page they are tagged with.",
    preview: previewURL('drawings'),
    components: draftButtons,
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrTeam,
    create: canCreateContent,
    update: canUpdateContent,
    delete: isEditor,
  },
  hooks: { ...refreshHooks, beforeChange: [makeShown] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'scene',
          options: [
            { label: "The temple's plan", value: 'plan' },
            { label: 'A scene', value: 'scene' },
          ],
          admin: { width: '40%', description: "A temple's plan is its layout, in the stack at the top of its page." },
        },
      ],
    },
    {
      name: 'faces',
      type: 'select',
      label: 'The deity faces',
      defaultValue: 'east',
      options: [
        { label: 'North', value: 'north' },
        { label: 'North-east', value: 'north-east' },
        { label: 'East', value: 'east' },
        { label: 'South-east', value: 'south-east' },
        { label: 'South', value: 'south' },
        { label: 'South-west', value: 'south-west' },
        { label: 'West', value: 'west' },
        { label: 'North-west', value: 'north-west' },
      ],
      admin: {
        condition: (data) => data?.kind === 'plan',
        description: 'The way the deity faces. Upload the drawing with the deity facing down (south): on the site, where north is at the top, it is turned to face this way.',
      },
    },
    {
      name: 'layoutOrder',
      type: 'number',
      label: 'Order in the stack of layouts',
      min: 1,
      admin: {
        condition: (data) => data?.kind === 'plan',
        description: "Where this layout sits in its temple's stack: 1 on top, then 2, 3… Layouts without a number come after, oldest first.",
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Upload the drawing as a large JPG or PNG, with the deity facing down.' },
    },
    {
      name: 'cut',
      type: 'checkbox',
      label: 'Cut to the drawing',
      defaultValue: true,
      admin: {
        description:
          'On: the copy shown on the site is cut to the drawing, with the same margin all round. Off: the whole image, as uploaded. Either way its white paper is made clear.',
      },
    },
    {
      name: 'shown',
      type: 'upload',
      relationTo: 'media',
      label: 'As shown on the site',
      admin: {
        readOnly: true,
        description:
          'Made from the image above when the drawing is saved: cut to the drawing with the same margin all round, its white paper made clear so the site’s off-white shows through. The image above is kept as it is.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'caption', type: 'text', admin: { width: '60%' } },
        { name: 'credit', type: 'text', defaultValue: 'Drawing by Abishek P.', admin: { width: '40%' } },
      ],
    },
    {
      type: 'row',
      fields: [templesField({ width: '50%' }), observancesField({ width: '50%' })],
    },
    regionField,
    reviewField,
    createdByField,
  ],
}
