import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor, publishedOrTeam } from '../access'
import { shortEditor } from '../editor'
import { createdByField, reviewField, slugField } from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'

export const Observances: CollectionConfig = {
  slug: 'observances',
  labels: { singular: 'Festival or ritual', plural: 'Festivals & rituals' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'tamil', 'kind', '_status'],
    description:
      'Each festival or ritual is explained once. Its page then gathers every temple, date, field note and article tagged with it.',
    preview: previewURL('observances'),
    components: draftButtons,
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrTeam, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'tamil',
          type: 'text',
          label: 'Name in Tamil',
          admin: { width: '50%', description: 'Shown large at the top of the page.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'festival',
          options: [
            { label: 'Festival', value: 'festival' },
            { label: 'Ritual', value: 'ritual' },
          ],
          admin: { width: '25%' },
        },
        {
          name: 'alsoKnownAs',
          type: 'text',
          label: 'Also known as',
          admin: { width: '75%', placeholder: 'e.g. Kodiyetram' },
        },
      ],
    },
    {
      name: 'gloss',
      type: 'text',
      required: true,
      label: 'In a few words',
      admin: { placeholder: 'e.g. the great annual festival' },
    },
    {
      name: 'about',
      type: 'array',
      label: 'Explanation',
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        description:
          'Questions and answers, in order: "What is it?", "When does it happen?", "What happens?", "What to look for", "In Pondicherry"…',
      },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', editor: shortEditor, required: true },
      ],
    },
    slugField('name'),
    reviewField,
    createdByField,
  ],
}
