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
        {
          name: 'quoteLabel',
          type: 'text',
          label: 'Small heading above it',
          admin: { placeholder: 'e.g. Why these temples', description: 'Leave empty for none.' },
        },
        {
          name: 'quote',
          type: 'textarea',
          label: 'Quotation',
          admin: {
            description: 'Each line here shows on its own line (e.g. the Tamil, then its English). Leave empty to hide the whole band.',
          },
        },
        { name: 'quoteBy', type: 'text', label: 'By', admin: { placeholder: '— Avvaiyar', description: 'Leave empty for no name.' } },
        {
          name: 'quoteAfter',
          type: 'textarea',
          label: 'A second passage under it (optional)',
          admin: { description: 'Shown below the name, set a little apart.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'quoteLinkText',
              type: 'text',
              label: 'Link under it (optional)',
              admin: { width: '50%', placeholder: 'e.g. Read more' },
            },
            {
              name: 'quoteLink',
              type: 'text',
              label: 'Goes to',
              admin: { width: '50%', placeholder: 'e.g. /about' },
            },
          ],
        },
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
