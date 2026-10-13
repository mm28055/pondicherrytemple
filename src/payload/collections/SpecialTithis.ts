import type { CollectionConfig } from 'payload'
import { TAMIL_MONTHS } from '../../lib/calendar'
import { NAKSHATRAS } from '../../lib/nakshatraNames'
import { TITHI_NAMES, type TithiKey } from '../../lib/tithiNames'
import { SPECIAL_ICONS, type SpecialIconKey } from '../../lib/specialIcons'
import { isAdmin, isEditor } from '../access'
import { listMemory } from '../preview'
import { refreshHooks } from '../revalidate'

/* The tithis kept as the year's great days in a Tamil month, like Chithra
   Pournami or Mahashivaratri: a rule of month and tithi, set once, that
   circles the day's moon or icon on every year's calendar (or, for a day
   kept on its nakshatram, the day that nakshatram holds nearest the tithi). */
export const SpecialTithis: CollectionConfig = {
  slug: 'special-tithis',
  labels: { singular: 'Special tithi', plural: 'Special tithis' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'month', 'tithi'],
    components: listMemory,
    description:
      'A tithi kept as a great day in a Tamil month, like Chithra Pournami (Chithirai, Pournami) or Mahashivaratri (Masi, Masa Shivaratri). Set once, it is circled on the month calendars every year, and named in the day’s pop-up.',
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%', placeholder: 'e.g. Chithra Pournami' } },
        { name: 'tamil', type: 'text', label: 'Name in Tamil', admin: { width: '50%', placeholder: 'e.g. சித்ரா பௌர்ணமி' } },
      ],
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
          name: 'tithi',
          type: 'select',
          required: true,
          // the two Pradoshams told apart by their fortnight
          options: (Object.keys(TITHI_NAMES) as TithiKey[]).map((k) => ({
            label: TITHI_NAMES[k].name + (k === 'pradosham-s' ? ' (Valarpirai)' : k === 'pradosham-k' ? ' (Theipirai)' : ''),
            value: k,
          })),
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'nakshatram',
      type: 'select',
      label: 'On the day of this nakshatram (optional)',
      options: NAKSHATRAS.map((n) => ({ label: n.name, value: n.name })),
      admin: {
        description:
          'For a day kept on its nakshatram, like Thai Pusam (Poosam) or Karthigai Deepam (Karthikai): the circle goes on the day nearest the tithi (up to two days either side) whose evening, from sunset to midnight, this nakshatram holds in. When that is the tithi’s own day, its moon or icon is circled; on another day, the nakshatram’s icon is.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'replaceIcon',
          type: 'checkbox',
          label: 'Replace tithi icon?',
          admin: { width: '50%', description: 'Show the day by another icon (below) in place of the tithi’s own.' },
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
