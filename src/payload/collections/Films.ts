import type { CollectionAfterChangeHook, CollectionConfig, Payload, PayloadRequest } from 'payload'
import { canCreateContent, canUpdateContent, isEditor, publishedOrTeam } from '../access'
import { fullEditor } from '../editor'
import {
  createdByField,
  observancesField,
  regionField,
  reviewField,
  slugField,
  templesField,
} from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'

/* Films: finished, edited videos made to be shared — the Centre's Instagram
   reels and anything like them. (A rough clip from a day at a temple is a
   field note instead.) Each has its own tab on the site, and appears on the
   pages of the temples and festivals it is tagged with.

   New Instagram posts arrive here by themselves as drafts
   (src/instagram/import.ts). */

const idOf = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : undefined

/* A film's details, given once here, passed to its files: its video and its
   still take the film's title as caption, its "made by" as credit, its date
   and its consent, and are marked as part of the film (their own forms then
   show that, in place of these fields); the video's still frame is the film's.
   The still is kept out of the temples' and festivals' Photographs (no tags of
   its own): the film itself already shows there. A file the film no longer
   uses is let go. Only what differs is written, so autosaves cost little. */
type FilmDoc = { id: number; title?: string | null; madeBy?: string | null; date?: string | null; consent?: string | null; video?: unknown; still?: unknown }
export async function passFilmToFiles(payload: Payload, doc: FilmDoc, previousDoc: Partial<FilmDoc> | undefined, req?: PayloadRequest) {
  const video = idOf(doc.video)
  const still = idOf(doc.still)
  const want = (extra: Record<string, unknown>) => ({
    partOf: { relationTo: 'films', value: doc.id },
    caption: doc.title ?? null,
    credit: doc.madeBy ?? null,
    consent: doc.consent ?? 'not-needed',
    temples: [],
    observances: [],
    ...extra,
  })
  const plans: [number, Record<string, unknown>][] = []
  if (video) plans.push([video, want({ poster: still ?? null })])
  if (still && still !== video) plans.push([still, want({ alt: `A still from the film “${doc.title ?? ''}”`, takenOn: doc.date ?? null, featured: false })])
  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
  for (const [id, data] of plans) {
    const m = (await payload.findByID({ collection: 'media', id, depth: 0, req, overrideAccess: true }).catch(() => null)) as Record<string, unknown> | null
    if (!m) continue
    const changed = Object.fromEntries(
      Object.entries(data).filter(([k, v]) => {
        const now = m[k]
        if (k === 'partOf') {
          const p = now as { relationTo?: string; value?: unknown } | null
          return !(p?.relationTo === 'films' && idOf(p?.value) === doc.id)
        }
        if (k === 'poster') return idOf(now) !== (v ?? undefined)
        if (k === 'temples' || k === 'observances') return Array.isArray(now) && now.length > 0
        return !same(now, v)
      }),
    )
    if (Object.keys(changed).length)
      await payload.update({ collection: 'media', id, data: changed, req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } })
  }
  // files this film no longer uses are let go
  for (const old of [idOf(previousDoc?.video), idOf(previousDoc?.still)]) {
    if (!old || old === video || old === still) continue
    const m = (await payload.findByID({ collection: 'media', id: old, depth: 0, req, overrideAccess: true }).catch(() => null)) as { partOf?: { relationTo?: string; value?: unknown } } | null
    if (m?.partOf?.relationTo === 'films' && idOf(m.partOf.value) === doc.id)
      await payload.update({ collection: 'media', id: old, data: { partOf: null }, req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } })
  }
}

const passToFiles: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
  if (context?.filmFiles !== false) await passFilmToFiles(req.payload, doc, previousDoc, req)
  return doc
}

export const Films: CollectionConfig = {
  slug: 'films',
  labels: { singular: 'Film', plural: 'Films' },
  defaultSort: '-date',
  admin: {
    group: 'Add to the site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'temples', '_status'],
    description:
      'Finished short films, such as the Centre’s Instagram reels. New Instagram posts arrive here as drafts every morning.',
    preview: previewURL('films'),
    components: draftButtons,
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  access: {
    read: publishedOrTeam,
    create: canCreateContent,
    update: canUpdateContent,
    delete: isEditor,
  },
  hooks: { ...refreshHooks, afterChange: [...refreshHooks.afterChange, passToFiles] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: { width: '35%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } },
        },
        {
          name: 'madeBy',
          type: 'text',
          label: 'Made by',
          admin: { width: '65%', placeholder: 'e.g. Centre for Shaiva Studies' },
        },
      ],
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { contains: 'video' } },
      admin: { description: 'The film itself: drop the video file here. Everything about it (caption, credit, date, consent) comes from this form.' },
    },
    {
      name: 'still',
      type: 'upload',
      relationTo: 'media',
      label: 'Still frame',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        description: 'The picture shown before the film plays. Drop one in, or take a frame from the video with the button below.',
      },
    },
    {
      name: 'frame',
      type: 'ui',
      admin: { components: { Field: '/components/admin/FrameButton#FrameButton' } },
    },
    {
      type: 'row',
      fields: [templesField({ width: '50%' }), observancesField({ width: '50%' })],
    },
    {
      name: 'body',
      type: 'richText',
      editor: fullEditor,
      label: 'Text',
      admin: { description: 'Shown beside the film. For Instagram films, the original caption.' },
    },
    {
      name: 'instagram',
      type: 'group',
      label: 'From Instagram',
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.instagram?.link) },
      fields: [
        { name: 'postId', type: 'text', index: true, admin: { hidden: true } },
        { name: 'link', type: 'text', label: 'Original post', admin: { readOnly: true } },
      ],
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
      admin: { position: 'sidebar', description: 'Films of people need their consent. Passed to the video and its still.' },
    },
    slugField('title', { withDate: true }),
    regionField,
    reviewField,
    createdByField,
  ],
}
