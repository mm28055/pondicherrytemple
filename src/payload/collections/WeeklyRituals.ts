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

const weekly = (data: { often?: string } | undefined) => (data?.often ?? 'weekly') === 'weekly'

/* What the temples do again and again: every week, on a day of the week
   (Varam: like the Durga puja on Tuesday afternoons, shown under every
   month's calendar, the week's days across the top), twice a month, or every
   month, on a tithi or a nakshatram (like Pradosham, or Punarpoosam). Each
   ritual once, with a section for each temple it is done at: when there (one
   or more times, each with its own details), and, where it differs there,
   its name, its Tamil and a few words; whether it is counted there in the
   Pancha Parvam; to be confirmed. Each temple's Ritual Year lists its own
   under every month. */
export const WeeklyRituals: CollectionConfig = {
  slug: 'weekly-rituals',
  labels: { singular: 'Regular repeating ritual', plural: 'Regular repeating rituals' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'what',
    defaultColumns: ['what', 'often', 'updatedAt'],
    components: listMemory,
    description:
      'What the temples do again and again: every week (shown under every month’s calendar, under its day of the week), twice a month or every month. Each ritual once, with a section for each temple it is done at. Each temple’s Ritual Year lists its own under every month.',
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
      name: 'about',
      type: 'textarea',
      label: 'In a few words',
      admin: {
        description: 'Optional: ten to twenty words for every temple without its own (each temple’s own go in its section, under “Different here”).',
        rows: 2,
      },
    },
    observancesField({ description: 'Optional: the festival or ritual it is, linked to its page (and its Tamil, if none is given above).' }),
    {
      name: 'atTemples',
      type: 'array',
      label: 'At each temple',
      labels: { singular: 'Temple', plural: 'Temples' },
      minRows: 1,
      required: true,
      admin: {
        description: 'A section for each temple it is done at: when, there (one or more times, each with its own details), and anything that is different there.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'temple', type: 'relationship', relationTo: 'temples', required: true, admin: { width: '50%' } },
            {
              name: 'panchaParvam',
              type: 'checkbox',
              label: 'Counted in the Pancha Parvam here',
              defaultValue: false,
              admin: {
                width: '50%',
                description: 'Listed with the Pancha Paruva Utsavam (பஞ்ச பருவ உற்சவம்) in this temple’s Ritual Year.',
              },
            },
          ],
        },
        {
          name: 'times',
          type: 'array',
          label: 'When, here',
          labels: { singular: 'Time', plural: 'Times' },
          minRows: 1,
          required: true,
          admin: {
            description: 'Once, or a row for each time it is done here with its own timing or details (e.g. Rahu Kala Durga Abhishekam on Tuesday and on Friday).',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'days',
                  type: 'select',
                  hasMany: true,
                  label: 'Day of the week',
                  options: WEEKDAYS,
                  admin: { width: '30%', condition: (data) => weekly(data) },
                  validate: (value: unknown, { data }: { data?: { often?: string } }) =>
                    !weekly(data) || (Array.isArray(value) && value.length > 0) ? true : 'Choose the day of the week.',
                },
                {
                  name: 'on',
                  type: 'text',
                  label: 'On',
                  admin: {
                    width: '30%',
                    placeholder: 'e.g. Trayodashi, Punarpoosam, Amavasya',
                    condition: (data) => !weekly(data),
                  },
                },
                {
                  name: 'time',
                  type: 'text',
                  label: 'When in the day',
                  admin: { width: '30%', placeholder: 'e.g. 3:30 pm onwards, Morning' },
                },
                {
                  name: 'details',
                  type: 'text',
                  label: 'Details',
                  admin: { width: '40%', placeholder: 'Anything particular to this time' },
                },
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Different here',
          admin: { initCollapsed: false, description: 'Its few words at this temple, and its name and Tamil where they differ here from the above.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', label: 'Its name here', admin: { width: '50%' } },
                { name: 'tamil', type: 'text', label: 'In Tamil, here', admin: { width: '50%' } },
              ],
            },
            { name: 'about', type: 'textarea', label: 'In a few words, here', admin: { rows: 2 } },
          ],
        },
        {
          name: 'tbc',
          type: 'checkbox',
          label: 'To be confirmed here',
          defaultValue: false,
          admin: { description: 'Marked TBC in this temple’s Ritual Year until it is confirmed.' },
        },
      ],
    },
  ],
}
