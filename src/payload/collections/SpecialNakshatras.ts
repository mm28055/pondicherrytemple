import type { CollectionConfig } from 'payload'
import { TAMIL_MONTHS } from '../../lib/calendar'
import { NAKSHATRAS } from '../../lib/nakshatraNames'
import { isAdmin, isEditor } from '../access'
import { listMemory } from '../preview'
import { refreshHooks } from '../revalidate'

/* The nakshatrams kept specially in a Tamil month, like Purattasi
   Thiruvonam: a rule of month and nakshatram, set once, that marks the
   day on every year's calendar. */
export const SpecialNakshatras: CollectionConfig = {
  slug: 'special-nakshatras',
  labels: { singular: 'Special nakshatram', plural: 'Special nakshatrams' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'month', 'nakshatram'],
    components: listMemory,
    description:
      'A nakshatram kept specially in a Tamil month, like Purattasi Thiruvonam. Set once, it is marked on the month calendars every year: on the day the nakshatram holds at sunrise.',
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { placeholder: 'e.g. Purattasi Thiruvonam' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'month',
          type: 'select',
          required: true,
          label: 'Tamil month',
          options: TAMIL_MONTHS.map((m) => ({ label: m.name, value: m.slug })),
          admin: { width: '50%' },
        },
        {
          name: 'nakshatram',
          type: 'select',
          required: true,
          options: NAKSHATRAS.map((n) => ({ label: n.name, value: n.name })),
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
