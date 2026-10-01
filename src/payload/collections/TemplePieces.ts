import type { CollectionConfig } from 'payload'
import { canCreateContent, canUpdateContent, isEditor, publishedOrTeam } from '../access'
import { fullEditor } from '../editor'
import { createdByField, regionField, reviewField, templesField } from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'

export const TemplePieces: CollectionConfig = {
  slug: 'temple-pieces',
  labels: { singular: 'Temple or people piece', plural: 'The temple & its people' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', 'temples', '_status'],
    description:
      'Short finished pieces, polished from the field notes, for each temple\'s "The Temple and its Stories" page: its histories, the place itself, its people, and its stories and songs.',
    preview: previewURL('temple-pieces'),
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
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { width: '60%', description: 'For people, their role: "The Bhattars", "The vahana keeper".' },
        },
        {
          name: 'topic',
          type: 'select',
          required: true,
          defaultValue: 'temple',
          label: 'Section',
          options: [
            { label: 'The place', value: 'temple' },
            { label: 'The people', value: 'people' },
            { label: 'History', value: 'history' },
            { label: 'Stories and Songs', value: 'stories' },
          ],
          admin: { width: '40%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        templesField({ width: '65%', description: 'It appears on the page of every temple chosen here.' }),
        {
          name: 'date',
          type: 'date',
          label: 'Date',
          // A new piece starts with today; change it if it should carry another date.
          defaultValue: () => new Date().toISOString(),
          admin: {
            width: '35%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
            description: 'Shown beside the title. The page lists the newest first.',
          },
        },
      ],
    },
    { name: 'body', type: 'richText', editor: fullEditor, label: 'Text', required: true },
    {
      name: 'picture',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Optional. A photo or drawing shown above the text.' },
    },
    {
      name: 'named',
      type: 'group',
      label: 'Naming a person',
      admin: {
        condition: (data) => data?.topic === 'people',
        description: 'People are described by their role. Give a name only with their consent.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            value && !siblingData?.consent
              ? 'Record when and how they agreed to be named first.'
              : true,
        },
        {
          name: 'consent',
          type: 'textarea',
          admin: { description: 'When and how they agreed to be named. Never shown.' },
        },
      ],
    },
    {
      name: 'sources',
      type: 'relationship',
      relationTo: 'field-notes',
      hasMany: true,
      label: 'Written from these field notes',
      admin: { description: 'For the editors checking it. Not shown on the site.' },
    },
    regionField,
    reviewField,
    createdByField,
  ],
}
