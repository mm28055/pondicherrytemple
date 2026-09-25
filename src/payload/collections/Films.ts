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

/* Films: finished, edited videos made to be shared — the Centre's Instagram
   reels and anything like them. (A rough clip from a day at a temple is a
   field note instead.) Each has its own tab on the site, and appears on the
   pages of the temples and festivals it is tagged with.

   New Instagram posts arrive here by themselves as drafts
   (src/instagram/import.ts). */

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
  hooks: refreshHooks,
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
      admin: { description: 'The film itself. Give it a still frame in its own settings, if you like.' },
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
    slugField('title', { withDate: true }),
    regionField,
    reviewField,
    createdByField,
  ],
}
