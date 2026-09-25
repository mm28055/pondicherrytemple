import type { CollectionConfig } from 'payload'
import { canUpdateOwn, isEditor, isLoggedIn } from '../access'
import { createdByField, observancesField, regionField } from '../fields'
import { refreshHooks } from '../revalidate'
import { describedBy } from '../descriptions'

export const Occasions: CollectionConfig = {
  slug: 'occasions',
  labels: { singular: 'Date in the year so far', plural: 'The year so far' },
  defaultSort: '-date',
  admin: {
    components: describedBy('occasions'),
    group: 'Temple pages',
    useAsTitle: 'label',
    defaultColumns: ['date', 'label', 'temple'],
  },
  access: { read: () => true, create: isLoggedIn, update: canUpdateOwn, delete: isEditor },
  hooks: refreshHooks,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            width: '35%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
          },
        },
        { name: 'temple', type: 'relationship', relationTo: 'temples', required: true, admin: { width: '65%' } },
      ],
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'What happened',
      admin: { placeholder: 'e.g. Brahmotsavam begins: the flag is hoisted' },
    },
    observancesField({ description: 'The festivals and rituals it involved.' }),
    {
      name: 'fieldNote',
      type: 'relationship',
      relationTo: 'field-notes',
      label: 'Field note about it',
      admin: { description: 'Optional. Linked from the year so far.' },
    },
    regionField,
    createdByField,
  ],
}
