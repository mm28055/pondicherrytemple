import type { GlobalConfig } from 'payload'
import { isEditor } from '../access'
import { refreshAfterGlobalChange } from '../revalidate'
import { WEEKDAYS } from '../collections/WeeklyRituals'

/* Varam: the character of each day of the week, what the town's people do
   on it, written once; shown under every month's calendar, with that day's
   weekly rituals. */
export const Varam: GlobalConfig = {
  slug: 'varam',
  label: 'Varam (the days of the week)',
  admin: {
    group: 'Site pages',
    description:
      'What each day of the week is like: what the town’s people do on it, how they make its character. Shown under every month’s calendar, with that day’s weekly rituals. Leave a blank line between paragraphs. An empty box shows placeholder text.',
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    {
      type: 'tabs',
      tabs: WEEKDAYS.map((d) => ({
        label: d.label,
        fields: [{ name: d.value, type: 'textarea' as const, label: `${d.label}: its character`, admin: { rows: 18 } }],
      })),
    },
  ],
}
