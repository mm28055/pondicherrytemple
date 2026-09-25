import type { GlobalConfig } from 'payload'
import { isEditor } from '../access'
import { shortEditor } from '../editor'
import { refreshAfterGlobalChange } from '../revalidate'

/* The words on the home page. Everything else there (the newest additions,
   the temples, the festivals) fills itself in from the rest of the admin. */

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  admin: {
    group: 'Site pages',
    description:
      'The words on the home page. The newest additions, temples and festivals shown there fill themselves in. "Save" puts changes on the site.',
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    { name: 'headline', type: 'text', required: true, admin: { description: 'The large heading.' } },
    {
      name: 'opening',
      type: 'richText',
      editor: shortEditor,
      label: 'Opening paragraphs',
      admin: { description: 'Shown under the heading, beside "Just added". Keep it to two short paragraphs.' },
    },
    {
      type: 'collapsible',
      label: 'The quotation (dark band)',
      fields: [
        { name: 'quote', type: 'textarea', label: 'Quotation' },
        { name: 'quoteBy', type: 'text', label: 'By', admin: { placeholder: '— Deepa Reddy, anthropologist · May 2026' } },
      ],
    },
    {
      type: 'collapsible',
      label: 'The book (band near the bottom)',
      fields: [
        { name: 'bookHeading', type: 'text', label: 'Heading' },
        { name: 'bookText', type: 'text', label: 'Line under it' },
      ],
    },
  ],
}
