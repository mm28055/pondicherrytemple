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

/* What the temples do again and again: every week, on a day of the week
   (Varam: like the Durga puja on Tuesday afternoons, shown under every
   month's calendar, the week's days across the top), twice a month, or every
   month, on a tithi or a nakshatram (like Pradosham, or Punarpoosam). Each
   temple's Ritual Year lists its own under every month. */
export const WeeklyRituals: CollectionConfig = {
  slug: 'weekly-rituals',
  labels: { singular: 'Regular ritual', plural: 'Regular rituals (Varam)' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'what',
    defaultColumns: ['what', 'often', 'days', 'on', 'temples'],
    components: listMemory,
    description:
      'What the temples do again and again: every week (Varam, shown under every month’s calendar, under its day of the week), twice a month or every month. Each temple’s Ritual Year lists its own under every month.',
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'what',
          type: 'text',
          required: true,
          label: 'What is done',
          admin: { width: '50%', placeholder: 'e.g. Durga puja' },
        },
        {
          name: 'tamil',
          type: 'text',
          label: 'In Tamil',
          admin: {
            width: '50%',
            description: 'Shown above it in a temple’s Ritual Year. Left empty: the Tamil of the festival or ritual chosen below.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'often',
          type: 'select',
          label: 'How often',
          defaultValue: 'weekly',
          options: [
            { label: 'Every week', value: 'weekly' },
            { label: 'Twice a month', value: 'fortnightly' },
            { label: 'Every month', value: 'monthly' },
          ],
          admin: { width: '25%' },
        },
        {
          name: 'days',
          type: 'select',
          hasMany: true,
          label: 'Day of the week',
          options: WEEKDAYS,
          admin: {
            width: '35%',
            description: 'One or more.',
            condition: (data) => (data?.often ?? 'weekly') === 'weekly',
          },
          validate: (value: unknown, { siblingData }: { siblingData?: { often?: string } }) =>
            (siblingData?.often ?? 'weekly') !== 'weekly' || (Array.isArray(value) && value.length > 0)
              ? true
              : 'Choose the day of the week.',
        },
        {
          name: 'on',
          type: 'text',
          label: 'On',
          admin: {
            width: '35%',
            placeholder: 'e.g. Trayodashi, Punarpoosam, Amavasya, the first Friday',
            description: 'The tithi, the nakshatram or the day it falls on.',
            condition: (data) => (data?.often ?? 'weekly') !== 'weekly',
          },
        },
        {
          name: 'time',
          type: 'text',
          label: 'When in the day',
          admin: { width: '40%', placeholder: 'e.g. 3:30 pm onwards, Morning, After 7:30 pm' },
        },
      ],
    },
    {
      name: 'tbc',
      type: 'checkbox',
      label: 'To be confirmed',
      defaultValue: false,
      admin: { description: 'Marked TBC in the temple’s Ritual Year until it is confirmed.' },
    },
    {
      name: 'about',
      type: 'textarea',
      label: 'In a few words',
      admin: {
        description: 'Ten to twenty words on what is done, shown below it in a temple’s Ritual Year.',
        rows: 2,
      },
    },
    {
      name: 'temples',
      type: 'relationship',
      relationTo: 'temples',
      hasMany: true,
      required: true,
    },
    observancesField({ description: 'Optional: the festival or ritual it is, linked to its page (and its Tamil, if none is given above).' }),
  ],
}
