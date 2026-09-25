import type { GlobalConfig } from 'payload'
import { isEditor, isLoggedIn } from '../access'
import { fieldName, SECTIONS } from '../descriptions'

/* The line of help shown under each section's name in the admin. Only the
   admin shows these; nothing here appears on the public site. */

export const SectionDescriptions: GlobalConfig = {
  slug: 'section-descriptions',
  label: 'Section descriptions',
  admin: {
    group: 'Admin',
    description:
      'The line of help shown under each section’s name here in the admin. Change any of them and save; an empty box brings back the original.',
  },
  access: { read: isLoggedIn, update: isEditor },
  fields: SECTIONS.map((s) => ({
    name: fieldName(s.slug),
    type: 'textarea' as const,
    label: s.label,
    defaultValue: s.text,
    admin: { rows: 2 },
  })),
}
