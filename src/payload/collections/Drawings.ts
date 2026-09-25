import type { CollectionConfig } from 'payload'
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
import { describedBy } from '../descriptions'

export const Drawings: CollectionConfig = {
  slug: 'drawings',
  labels: { singular: 'Drawing', plural: 'Drawings' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'image', '_status'],
    preview: previewURL('drawings'),
    components: { ...draftButtons, ...describedBy('drawings') },
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrTeam,
    create: canCreateContent,
    update: canUpdateContent,
    delete: isEditor,
  },
  hooks: refreshHooks,
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
          admin: { width: '40%', description: "A temple's plan is shown first on its page." },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Upload the drawing as a large JPG or PNG.' },
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
