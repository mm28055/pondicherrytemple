import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'
import { canUpdateOwn, isEditor, isLoggedIn } from '../access'
import { createdByField } from '../fields'
import { refreshHooks } from '../revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

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
  hooks: refreshHooks,
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
