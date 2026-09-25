import type { CollectionConfig } from 'payload'
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
import { describedBy } from '../descriptions'

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

export const FieldNotes: CollectionConfig = {
  slug: 'field-notes',
  labels: { singular: 'Field note', plural: 'Field notes' },
  defaultSort: '-date',
  admin: {
    group: 'Add to the site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'temples', '_status'],
    preview: previewURL('field-notes'),
    components: { ...draftButtons, ...describedBy('field-notes') },
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
      required: true,
      label: 'Written by',
      admin: { description: 'Type a name and press Enter. Add as many as needed.' },
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
