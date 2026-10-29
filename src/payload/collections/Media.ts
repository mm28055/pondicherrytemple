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
  // (a copy of the live site's own files, made on this laptop, is taken as it is)
  if (req.context?.mirror) return data
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

/* A file that is part of a film (its video, its still) takes its details from
   the film (its caption, credit, date, consent), filled in when the film is
   saved (collections/Films.ts); so does a video or recording in a field note
   take its place from the note. Their forms here show where they belong in
   place of the fields that come from there. Videos' own temple and festival
   tags are not asked for at all: the site never reads them. */
type MediaData = { mimeType?: string | null; partOf?: { relationTo?: string; value?: unknown } | null }
const inFilm = (d: MediaData) => d?.partOf?.relationTo === 'films'
const partOfSomething = (d: MediaData) => Boolean(d?.partOf?.value)
const isImage = (d: MediaData) => !d?.mimeType || d.mimeType.startsWith('image/')

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo, video or file', plural: 'Photos & videos' },
  admin: {
    group: 'Add to the site',
    defaultColumns: ['filename', 'set', 'credit', 'takenAt', 'caption'],
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
      name: 'partOf',
      type: 'relationship',
      relationTo: ['films', 'field-notes'],
      label: 'Part of',
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: (data) => partOfSomething(data),
        description: 'Its details come from here: open it to change them. Nothing else to fill in on this file.',
      },
    },
    {
      name: 'set',
      type: 'relationship',
      relationTo: 'photo-sets',
      label: 'Photo set',
      index: true,
      admin: {
        position: 'sidebar',
        condition: (data) => isImage(data) && !inFilm(data),
        description: 'The day or event it was taken at: it appears wherever its set does, with no tags of its own needed.',
      },
    },
    {
      // its place in its set, as arranged in the set's photo grid (empty: by the time taken)
      name: 'position',
      type: 'number',
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'What it shows',
      admin: {
        condition: (data) => !inFilm(data),
        description: 'A few words describing the photo, for people who cannot see it.',
      },
    },
    { name: 'caption', type: 'text', admin: { condition: (data) => !inFilm(data) } },
    {
      name: 'credit',
      type: 'text',
      admin: {
        condition: (data) => !inFilm(data),
        placeholder: 'e.g. Courtesy Sriram Sharma',
        description: 'Who took it. Shown with the photo, except the team’s own (Photograph: Deepa, Photograph: Arunaditya), which are kept here but not shown.',
      },
    },
    {
      name: 'takenOn',
      type: 'date',
      label: 'Taken on',
      admin: {
        condition: (data) => isImage(data) && !inFilm(data),
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description:
          'Optional. The day the photo was taken, so it is grouped under the right year. Photos in a field note take the note’s date.',
      },
    },
    {
      name: 'takenAt',
      type: 'date',
      label: 'Time taken',
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data?.takenAt),
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMMM yyyy, h:mm:ss a' },
        description: 'From the camera, when the photo was brought in. A day’s photos are shown in this order.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Still frame',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        condition: (data) => Boolean(data?.mimeType?.startsWith('video/')) && !inFilm(data),
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
        condition: (data) => isImage(data) && !inFilm(data),
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
        condition: (data) => !inFilm(data),
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
        // photos only, and not a film's still (videos' tags are never read; a still stays out of Photographs)
        condition: (data) => isImage(data) && !inFilm(data),
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
        condition: (data) => isImage(data) && !inFilm(data),
        description:
          'A photo tagged here appears in the Photographs section of each festival’s or ritual’s page. Photos in a field note appear there by themselves.',
      },
    },
    createdByField,
  ],
}
