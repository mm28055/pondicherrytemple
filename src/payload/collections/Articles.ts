import type { CollectionConfig } from 'payload'
import { canCreateContent, canUpdateContent, isEditor, publishedOrTeam } from '../access'
import { fullEditor } from '../editor'
import {
  createdByField,
  observancesField,
  reviewField,
  slugField,
  templesField,
} from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'
import { describedBy } from '../descriptions'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  defaultSort: '-date',
  admin: {
    group: 'Add to the site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'date', '_status'],
    preview: previewURL('articles'),
    components: { ...draftButtons, ...describedBy('articles') },
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
        { name: 'author', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: { width: '40%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } },
        },
      ],
    },
    {
      name: 'teaser',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two sentences shown in lists.' },
    },
    { name: 'body', type: 'richText', editor: fullEditor, label: 'Text', required: true },
    {
      type: 'row',
      fields: [templesField({ width: '50%' }), observancesField({ width: '50%' })],
    },
    slugField('title'),
    reviewField,
    createdByField,
  ],
}
