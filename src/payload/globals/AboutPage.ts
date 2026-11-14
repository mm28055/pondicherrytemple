import type { GlobalConfig } from 'payload'
import { isEditor } from '../access'
import { fullEditor } from '../editor'
import { refreshAfterGlobalChange } from '../revalidate'

/* The About page: an opening line, then sections in order, the team, and
   how to get in touch. */

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About page',
  admin: {
    group: 'Site pages',
    description: 'Everything on the About page. Drag sections to reorder them. "Save" puts changes on the site.',
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    {
      name: 'lede',
      type: 'textarea',
      label: 'Opening line',
      admin: { description: 'Under the title. Optional: since 9 November 2026 the page opens straight into its first section.' },
    },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Section', plural: 'Sections' },
      admin: { description: 'Each has a heading and its text, shown in this order.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'heading', type: 'text', required: true, admin: { width: '65%' } },
            {
              name: 'anchor',
              type: 'text',
              label: 'Link name (optional)',
              admin: {
                width: '35%',
                description: 'Lets other pages link straight here. The home page uses "idea" and "why". The section named "centre" is shown just before the team.',
              },
            },
          ],
        },
        { name: 'body', type: 'richText', editor: fullEditor, label: 'Text', required: true },
      ],
    },
    {
      name: 'team',
      type: 'array',
      label: 'The team',
      labels: { singular: 'Person', plural: 'People' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'role', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'A line or two about them',
          admin: {
            description:
              'To make words a link, write them in square brackets with the address after, in round ones: [Heritage Temples](https://heritagetemples.org)',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        { name: 'contactText', type: 'textarea', label: 'Text' },
        { name: 'contactEmail', type: 'email', label: 'Email for "Write to the project"' },
      ],
    },
  ],
}
