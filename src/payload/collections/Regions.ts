import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor } from '../access'
import { shortEditor } from '../editor'
import { slugField } from '../fields'
import { refreshHooks } from '../revalidate'

export const Regions: CollectionConfig = {
  slug: 'regions',
  labels: { singular: 'Region', plural: 'Regions' },
  admin: {
    group: 'Admin',
    useAsTitle: 'name',
    description: 'The towns the project documents. Only Pondicherry for now.',
  },
  access: { read: () => true, create: isAdmin, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'intro',
      type: 'richText',
      editor: shortEditor,
      label: 'Introduction',
      admin: { description: 'Shown at the top of the Temples page.' },
    },
    {
      name: 'totalTemples',
      type: 'number',
      label: 'Temples in the town, roughly',
      admin: { position: 'sidebar' },
    },
    {
      name: 'calendar',
      type: 'select',
      required: true,
      defaultValue: 'tamil',
      options: [{ label: 'Tamil', value: 'tamil' }],
      admin: { position: 'sidebar', description: 'The local calendar dates are labelled in.' },
    },
    slugField('name'),
  ],
}
