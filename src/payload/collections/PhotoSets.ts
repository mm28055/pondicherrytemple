import type { CollectionConfig } from 'payload'
import { canCreateContent, canUpdateContent, isEditor } from '../access'
import { createdByField, observancesField, regionField, templesField } from '../fields'
import { refreshHooks } from '../revalidate'

/* The photographs of one visit: a temple's day (or event), as they were kept
   in their folder (temple / date_event / photos). Its photos belong where it
   does, so each needs no tags of its own:
   - on the pages of its temples;
   - beside the field note of the same temple and day, by itself, as soon as
     that note is published (or the one chosen here);
   - on the pages of that day's festivals and rituals at its temples (from
     "The year so far"), and of any chosen here;
   - always on the Photographs page;
   - ticked "Pondicherry's Hindu Ethos": a card of its own in that section of
     the Temples page. */
export const PhotoSets: CollectionConfig = {
  slug: 'photo-sets',
  labels: { singular: 'Photo set', plural: 'Photo sets' },
  defaultSort: '-date',
  admin: {
    group: 'Add to the site',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'temples', 'ethos'],
    description:
      'The photographs of one day or event, as kept in its folder. They appear on the pages of its temples, beside the field note of the same temple and day (by themselves, once it is published), on the pages of that day’s festivals and rituals, and on the Photographs page.',
  },
  access: {
    read: () => true,
    create: canCreateContent,
    update: canUpdateContent,
    delete: isEditor,
  },
  hooks: refreshHooks,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { width: '45%' } },
        {
          name: 'short',
          type: 'text',
          label: 'Short name',
          admin: {
            width: '30%',
            description:
              'The occasion in a few words, beside each photo in the viewer ("Brahmotsavam Day 5"). Empty: the title up to its first comma, and no further than "Day 5".',
          },
        },
        {
          name: 'date',
          type: 'date',
          index: true,
          admin: {
            width: '25%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
            description: 'The day they were taken. Empty where it is not known.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        templesField({ width: '50%', description: 'The temples they were taken at. Empty for none.' }),
        observancesField({
          width: '50%',
          description: 'Only where the day’s festivals and rituals (from “The year so far”) are not enough: these are added to them.',
        }),
      ],
    },
    {
      name: 'ethos',
      type: 'checkbox',
      label: "Pondicherry's Hindu Ethos",
      defaultValue: false,
      admin: { description: 'A card of its own in the section "Pondicherry\'s Hindu Ethos" on the Temples page.' },
    },
    {
      name: 'fieldNote',
      type: 'relationship',
      relationTo: 'field-notes',
      label: 'Field note',
      admin: {
        description:
          'Optional. Left empty, they go beside every field note of the same day and temple. Chosen, beside this note only.',
      },
    },
    {
      name: 'photos',
      type: 'join',
      collection: 'media',
      on: 'set',
      defaultLimit: 50,
      admin: { defaultColumns: ['filename', 'credit', 'featured'] },
    },
    {
      name: 'folder',
      type: 'text',
      label: 'From the folder',
      admin: { position: 'sidebar', readOnly: true, description: 'Where its photos were brought in from.' },
    },
    regionField,
    createdByField,
  ],
}
