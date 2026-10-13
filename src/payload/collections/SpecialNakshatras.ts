import type { CollectionConfig } from 'payload'
import { TAMIL_MONTHS } from '../../lib/calendar'
import { NAKSHATRAS } from '../../lib/nakshatraNames'
import { SPECIAL_ICONS, type SpecialIconKey } from '../../lib/specialIcons'
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
    {
      type: 'row',
      fields: [
        {
          name: 'replaceIcon',
          type: 'checkbox',
          label: 'Replace Nakshatram icon?',
          admin: { width: '50%', description: 'Show the day by another icon (below) in place of the nakshatram’s own.' },
        },
        {
          name: 'icon',
          type: 'select',
          label: 'New icon',
          options: (Object.keys(SPECIAL_ICONS) as SpecialIconKey[]).map((k) => ({ label: SPECIAL_ICONS[k].label, value: k })),
          // asked for only when the box is ticked, and then needed
          validate: (value: unknown, { siblingData }: { siblingData: { replaceIcon?: boolean } }) =>
            !siblingData?.replaceIcon || value ? true : 'Choose the icon to show in its place.',
          admin: { width: '50%', condition: (_: unknown, sibling: { replaceIcon?: boolean }) => Boolean(sibling?.replaceIcon) },
        },
      ],
    },
  ],
}
