import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor, publishedOrTeam } from '../access'
import { regionField, reviewField } from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'
import { describedBy } from '../descriptions'

export const Books: CollectionConfig = {
  slug: 'books',
  labels: { singular: 'Book outline', plural: 'The book' },
  admin: {
    group: 'Site pages',
    useAsTitle: 'title',
    preview: previewURL('books'),
    components: { ...draftButtons, ...describedBy('books') },
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrTeam, create: isAdmin, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'The Temples of Pondicherry' },
    {
      type: 'row',
      fields: [
        { name: 'status', type: 'text', required: true, admin: { width: '30%', placeholder: 'In preparation' } },
        { name: 'byline', type: 'text', required: true, label: 'By', admin: { width: '40%' } },
        { name: 'illustrations', type: 'text', label: 'Illustrations by', admin: { width: '30%' } },
      ],
    },
    {
      name: 'parts',
      type: 'array',
      labels: { singular: 'Part', plural: 'Parts' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'summary', type: 'textarea', required: true },
        {
          name: 'link',
          type: 'group',
          admin: { description: 'Optional: a link to where the site already covers this part.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', admin: { width: '50%', placeholder: 'The temples' } },
                { name: 'href', type: 'text', label: 'Address', admin: { width: '50%', placeholder: '/pondicherry' } },
              ],
            },
          ],
        },
      ],
    },
    regionField,
    reviewField,
  ],
}
