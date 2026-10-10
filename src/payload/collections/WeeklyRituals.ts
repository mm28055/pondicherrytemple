import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor } from '../access'
import { observancesField } from '../fields'
import { listMemory } from '../preview'
import { refreshHooks } from '../revalidate'

export const WEEKDAYS = [
  { label: 'Sunday', value: 'sun' },
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
]

/* Varam: what the temples do every week, on a day of the week, like the
   Durga puja on Tuesday afternoons. Shown under every month's calendar, the
   week's days across the top. */
export const WeeklyRituals: CollectionConfig = {
  slug: 'weekly-rituals',
  labels: { singular: 'Weekly ritual', plural: 'Weekly rituals (Varam)' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'what',
    defaultColumns: ['what', 'days', 'time', 'temples'],
    components: listMemory,
    description:
      'What the temples do every week, like the Durga puja on Tuesday afternoons. Shown under every month’s calendar, under its day of the week.',
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    {
      name: 'what',
      type: 'text',
      required: true,
      label: 'What is done',
      admin: { placeholder: 'e.g. Durga puja' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'days',
          type: 'select',
          hasMany: true,
          required: true,
          label: 'Day of the week',
          options: WEEKDAYS,
          admin: { width: '50%', description: 'One or more.' },
        },
        {
          name: 'time',
          type: 'text',
          label: 'When in the day',
          admin: { width: '50%', placeholder: 'e.g. 3:30 pm onwards, Morning, After 7:30 pm' },
        },
      ],
    },
    {
      name: 'temples',
      type: 'relationship',
      relationTo: 'temples',
      hasMany: true,
      required: true,
    },
    observancesField({ description: 'Optional: the festival or ritual it is, linked to its page.' }),
  ],
}
