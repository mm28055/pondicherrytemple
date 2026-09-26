import type { GlobalConfig } from 'payload'
import { isEditor } from '../access'
import { refreshAfterGlobalChange } from '../revalidate'
import { SECTION_INTROS } from '../sectionIntros'

/* The opening line under the title of each section page on the site. The
   Temples, Home and About pages keep theirs with the rest of their words. */

export const SectionDescriptions: GlobalConfig = {
  slug: 'section-descriptions',
  label: 'Section descriptions',
  admin: {
    group: 'Site pages',
    description:
      'The line under the title of each section of the site. "Save" puts changes on the site; an empty box brings back the original.',
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: SECTION_INTROS.map((s) => ({
    name: s.name,
    type: 'textarea' as const,
    label: s.label,
    defaultValue: s.text,
    admin: { rows: 3 },
  })),
}
