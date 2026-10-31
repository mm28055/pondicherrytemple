import type { CollectionConfig } from 'payload'
import { canUpdateOwn, isEditor, isLoggedIn } from '../access'
import { createdByField, observancesField, regionField } from '../fields'
import { listMemory } from '../preview'
import { refreshHooks } from '../revalidate'

export const Occasions: CollectionConfig = {
  slug: 'occasions',
  labels: { singular: 'Date in the year so far', plural: 'The year so far' },
  defaultSort: '-date',
  admin: {
    group: 'Temple pages',
    useAsTitle: 'label',
    defaultColumns: ['date', 'label', 'temple'],
    components: listMemory,
    description:
      "Every occasion the team was present for. These make each temple's 'year so far', and the 'where we've seen it' list on festival pages.",
  },
  access: { read: () => true, create: isLoggedIn, update: canUpdateOwn, delete: isEditor },
  hooks: refreshHooks,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            width: '35%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
          },
        },
        {
          name: 'temple',
          type: 'relationship',
          relationTo: 'temples',
          admin: { width: '65%', description: 'Leave empty for an event of the whole town, like the Masi Maham Theerthavari.' },
        },
      ],
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'What happened',
      admin: { placeholder: 'e.g. Brahmotsavam begins: the flag is hoisted' },
    },
    {
      name: 'tbc',
      type: 'checkbox',
      label: 'To be confirmed',
      admin: { description: 'Shown in the calendars marked "to be confirmed" until this is unticked.' },
    },
    observancesField({ description: 'The festivals and rituals it involved.' }),
    {
      name: 'notInYear',
      type: 'checkbox',
      label: 'Leave out of the temple’s Ritual Year',
      admin: { description: 'Still in the calendar and the year so far; not listed under its month in the Ritual Year (like the eve of a festival).' },
    },
    {
      name: 'yearNote',
      type: 'text',
      label: 'In the Ritual Year, a line below its name',
      admin: { description: 'Optional, shown in italics: e.g. “as part of the Veerabhadraswamy Chowdambika Koyil’s Aadi Peruvizha”.' },
    },
    {
      name: 'schedule',
      type: 'array',
      label: 'The day’s schedule',
      labels: { singular: 'Time', plural: 'Times' },
      admin: {
        description: 'Optional: what was to happen when, as the patrikai or the board gave it. Shown in the calendar’s pop-up for the day.',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'time', type: 'text', required: true, admin: { width: '25%', placeholder: 'e.g. 7 PM' } },
            { name: 'what', type: 'text', required: true, admin: { width: '75%', placeholder: 'e.g. Garuda Sevai veethi purappadu' } },
          ],
        },
      ],
    },
    {
      name: 'fieldNote',
      type: 'relationship',
      relationTo: 'field-notes',
      label: 'Field note about it',
      admin: { description: 'Optional. Linked from the year so far.' },
    },
    regionField,
    createdByField,
  ],
}
