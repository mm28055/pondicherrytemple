import fs from 'fs/promises'
import path from 'path'
import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'
import { checkVideoAt, checkVideoBytes, HEVC_MESSAGE, isHevc } from '../../lib/videoCheck'
import { fileURLToPath } from 'url'
import { canUpdateOwn, isEditor, isLoggedIn } from '../access'
import { createdByField } from '../fields'
import { refreshHooks } from '../revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/* A video in HEVC (H.265, an iPhone's usual format) plays in only some
   browsers, so it is refused, with a note on how to export it as H.264. The
   check reads only the video's header: from the upload itself, where the
   server has it (on this laptop), or from storage (on the site, where uploads
   go from the browser straight to R2 and the server never holds the file). */
const refuseHevc: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  const type: string = data?.mimeType ?? req.file?.mimetype ?? ''
  if (!type.startsWith('video/')) return data
  const file = req.file as { data?: Buffer; tempFilePath?: string } | undefined
  let codecs: string[] = []
  if (file?.data?.length) codecs = checkVideoBytes(file.data).codecs
  else if (file?.tempFilePath) codecs = checkVideoBytes(await fs.readFile(file.tempFilePath)).codecs
  else {
    // a new file uploaded straight to R2: read its header there
    const isNew = operation === 'create' || (data?.filename && data.filename !== originalDoc?.filename)
    const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    if (!isNew || !base || !data?.filename) return data
    const url = `${base}/${data.prefix ? `${data.prefix}/` : ''}${encodeURIComponent(data.filename)}`
    try {
      codecs = (await checkVideoAt(url)).codecs
    } catch {
      return data // storage could not be read just now: let it through rather than refuse a good file
    }
  }
  if (isHevc(codecs)) throw new APIError(HEVC_MESSAGE, 400, undefined, true)
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo, video or file', plural: 'Photos & videos' },
  admin: {
    group: 'Add to the site',
    defaultColumns: ['filename', 'caption', 'consent', 'temples', 'observances'],
    description:
      'Every photo, video, recording and document. Drag several files in at once to upload them together.',
  },
  access: {
    // Files of people who have not agreed are kept off the public site.
    read: ({ req }) => (req.user ? true : { consent: { not_equals: 'withhold' } }),
    create: isLoggedIn,
    update: canUpdateOwn,
    delete: isEditor,
  },
  hooks: { ...refreshHooks, beforeChange: [refuseHevc] },
  upload: {
    // On this laptop: MEDIA_DIR (see .env). With R2 keys in .env: Cloudflare R2.
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../../.data/media'),
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    // Smaller copies of every photo, made automatically, so pages load fast.
    imageSizes: [
      { name: 'thumbnail', width: 480 },
      { name: 'card', width: 960 },
      { name: 'large', width: 1800 },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'What it shows',
      admin: { description: 'A few words describing the photo, for people who cannot see it.' },
    },
    { name: 'caption', type: 'text' },
    { name: 'credit', type: 'text', admin: { placeholder: 'e.g. Photograph: Arunaditya' } },
    {
      name: 'takenOn',
      type: 'date',
      label: 'Taken on',
      admin: {
        condition: (data) => !data?.mimeType || Boolean(data.mimeType.startsWith('image/')),
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description:
          'Optional. The day the photo was taken, so it is grouped under the right year. Photos in a field note take the note’s date.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Still frame',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        condition: (data) => Boolean(data?.mimeType?.startsWith('video/')),
        description: 'The picture shown before the video plays. Optional.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show first',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        condition: (data) => !data?.mimeType || Boolean(data.mimeType.startsWith('image/')),
        description:
          'Put this photo first in the Photographs section of its temples and festivals. The very first is shown large.',
      },
    },
    {
      name: 'consent',
      type: 'select',
      required: true,
      defaultValue: 'not-needed',
      options: [
        { label: 'No one identifiable — not needed', value: 'not-needed' },
        { label: 'Consent given', value: 'given' },
        { label: 'Consent not given — keep off the site', value: 'withhold' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Photos, videos and recordings of people need their consent.',
      },
    },
    {
      name: 'temples',
      type: 'relationship',
      relationTo: 'temples',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'A photo tagged here appears in the Photographs section of each temple’s page.',
      },
    },
    {
      name: 'observances',
      label: 'Festivals & rituals',
      type: 'relationship',
      relationTo: 'observances',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description:
          'A photo tagged here appears in the Photographs section of each festival’s or ritual’s page. Photos in a field note appear there by themselves.',
      },
    },
    createdByField,
  ],
}
