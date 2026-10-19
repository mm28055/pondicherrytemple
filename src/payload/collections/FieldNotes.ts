import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
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

/* A field note is simply: a title, a date, the temples and festivals it is
   about, the text, photographs and videos. What kind of note it is (a note,
   videos, photographs) is worked out automatically for the Field Notes tab's
   filters — nobody has to choose. */

type Node = { text?: string; children?: Node[] }
const hasWords = (body: unknown): boolean => {
  const walk = (n: Node): boolean => Boolean(n.text?.trim()) || (n.children ?? []).some(walk)
  return walk(((body as { root?: Node } | null)?.root ?? {}) as Node)
}
const count = (v: unknown) => (Array.isArray(v) ? v.length : 0)
const idOf = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : undefined

/* A note's videos and recordings are marked as part of it, so their own forms
   show where they belong and ask nothing more (their temples and festivals are
   the note's). Only a file not already marked is written; the note itself is
   never changed. */
const markFiles: CollectionAfterChangeHook = async ({ doc, req }) => {
  const ids = [...(Array.isArray(doc.videos) ? doc.videos : []), doc.recording].map(idOf).filter((id): id is number => Boolean(id))
  for (const id of ids) {
    const m = (await req.payload.findByID({ collection: 'media', id, depth: 0, req, overrideAccess: true }).catch(() => null)) as {
      partOf?: { relationTo?: string; value?: unknown } | null
    } | null
    if (!m || m.partOf?.value) continue // already part of this note, or of a film
    await req.payload.update({ collection: 'media', id, data: { partOf: { relationTo: 'field-notes', value: doc.id } }, req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } })
  }
  return doc
}

export const FieldNotes: CollectionConfig = {
  slug: 'field-notes',
  labels: { singular: 'Field note', plural: 'Field notes' },
  defaultSort: '-date',
  admin: {
    group: 'Add to the site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'temples', '_status'],
    description: 'Everything recorded at the temples: what happened, in words, photographs and videos.',
    preview: previewURL('field-notes'),
    components: draftButtons,
  },
  // Saves as you type; "Publish" puts it on the site.
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  access: {
    read: publishedOrTeam,
    create: canCreateContent,
    update: canUpdateContent,
    delete: isEditor,
  },
  hooks: {
    ...refreshHooks,
    afterChange: [...refreshHooks.afterChange, markFiles],
    beforeChange: [
      ({ data, originalDoc }) => {
        const videos = count(data.videos ?? originalDoc?.videos)
        const photos = count(data.photos ?? originalDoc?.photos)
        const words = hasWords(data.body ?? originalDoc?.body)
        data.kind = videos ? 'video' : photos && !words ? 'photos' : 'note'
        return data
      },
    ],
  },
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
          name: 'occasion',
          type: 'text',
          required: true,
          label: 'Occasion',
          admin: { width: '65%', placeholder: 'e.g. The Brahmotsavam begins' },
        },
      ],
    },
    {
      name: 'authors',
      type: 'text',
      hasMany: true,
      label: 'Written by',
      admin: { description: 'Optional. Type a name and press Enter; add as many as needed.' },
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
      admin: {
        description:
          'Write here, or paste from Word or Google Docs. To put a photo or video in the middle of the text: + → Upload.',
      },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Photographs',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Drag photos in — several at once is fine. They are shown together after the text.' },
    },
    {
      name: 'videos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Videos',
      filterOptions: { or: [{ mimeType: { contains: 'video' } }, { mimeType: { contains: 'audio' } }] },
      admin: { description: 'Drag video (or audio) files in. Each plays on the note, with its caption.' },
    },
    {
      name: 'removed',
      type: 'array',
      label: 'Taken out of the running-log original',
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        initCollapsed: true,
        description: 'For the reviewers: what was removed when this was edited from the running log. Never shown.',
      },
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    // Set automatically (see the hook above); kept out of sight.
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'note',
      options: ['note', 'interview', 'video', 'audio', 'photos'],
      admin: { hidden: true },
    },
    // Earlier single-recording fields, kept only so nothing stored is lost.
    { name: 'recording', type: 'upload', relationTo: 'media', admin: { hidden: true } },
    { name: 'poster', type: 'upload', relationTo: 'media', admin: { hidden: true } },
    { name: 'recordingCaption', type: 'text', admin: { hidden: true } },
    // Filled in when a note is brought in from Instagram.
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
    slugField('title', { withDate: true }),
    regionField,
    reviewField,
    createdByField,
  ],
}
