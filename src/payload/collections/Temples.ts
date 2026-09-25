import type { CollectionConfig } from 'payload'
import { DEITY_GROUP_LABELS } from '../../content/labels'
import { isAdmin, isEditor, publishedOrTeam } from '../access'
import { shortEditor } from '../editor'
import { createdByField, regionField, slugField } from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'

/* A temple's screen in the admin is the hub for everything on its page: its
   own details, and — in the other tabs — every piece tagged with it, each
   editable in place, with "Add new" creating one already tagged. */

export const Temples: CollectionConfig = {
  slug: 'temples',
  labels: { singular: 'Temple', plural: 'Temples' },
  // Drag to reorder in the list: the site shows temples in this order.
  orderable: true,
  admin: {
    group: 'Temple pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'knownAs', 'deityGroup', 'street', '_status'],
    description:
      'The temples being documented, in the order the site shows them — drag to reorder. Open a temple to edit everything on its page.',
    preview: previewURL('temples'),
    components: draftButtons,
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: { read: publishedOrTeam, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'The temple',
          description: 'Its name, deity, street and introduction. A temple gets its own page once it has an introduction.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                {
                  name: 'knownAs',
                  type: 'text',
                  label: 'Known in town as',
                  admin: { width: '50%', placeholder: 'e.g. Chetty Kovil' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'deity',
                  type: 'text',
                  required: true,
                  admin: { width: '50%', placeholder: 'e.g. Vishnu as Varadaraja Perumal' },
                },
                {
                  name: 'deityGroup',
                  label: 'Deity',
                  type: 'select',
                  required: true,
                  options: Object.entries(DEITY_GROUP_LABELS).map(([value, label]) => ({ value, label })),
                  admin: { width: '25%' },
                },
                { name: 'street', type: 'text', admin: { width: '25%' } },
              ],
            },
            {
              name: 'intro',
              type: 'richText',
              editor: shortEditor,
              label: 'Introduction',
              admin: { description: 'A few paragraphs, shown at the top of the temple’s page.' },
            },
            {
              name: 'coordinates',
              type: 'group',
              label: 'Location on the map',
              admin: { description: 'For a future town map. Optional.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'lat', type: 'number', label: 'Latitude', admin: { width: '50%' } },
                    { name: 'lng', type: 'number', label: 'Longitude', admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'The temple & its people',
          description:
            'The pieces under "The temple" and "The people" on this temple’s page. Click one to edit it; "Add new" makes one already tagged with this temple.',
          fields: [
            {
              name: 'pieces',
              label: 'Pieces',
              type: 'join',
              collection: 'temple-pieces',
              on: 'temples',
              // in the order the site shows them
              defaultSort: 'createdAt',
              defaultLimit: 50,
              admin: { defaultColumns: ['title', 'topic', '_status'] },
            },
          ],
        },
        {
          label: 'The year so far',
          description:
            'Every date the team was present, oldest first. "Add new" adds a date at this temple. The festivals and rituals tagged on these dates make the "Festivals & rituals seen here" list.',
          fields: [
            {
              name: 'yearSoFar',
              label: 'Dates',
              type: 'join',
              collection: 'occasions',
              on: 'temple',
              defaultSort: 'date',
              defaultLimit: 100,
              admin: { defaultColumns: ['date', 'label', 'observances'] },
            },
          ],
        },
        {
          label: 'Drawings',
          description: "Abishek's drawings shown at the top of this temple’s page — its plan first.",
          fields: [
            {
              name: 'drawings',
              type: 'join',
              collection: 'drawings',
              on: 'temples',
              defaultSort: 'createdAt',
              admin: { defaultColumns: ['title', 'kind', 'image', '_status'] },
            },
          ],
        },
        {
          label: 'Field notes & articles',
          description: 'Everything written about this temple. "Add new" starts one already tagged with it.',
          fields: [
            {
              name: 'fieldNotes',
              label: 'Field notes',
              type: 'join',
              collection: 'field-notes',
              on: 'temples',
              defaultSort: '-date',
              defaultLimit: 50,
              admin: { defaultColumns: ['title', 'date', '_status'] },
            },
            {
              name: 'articles',
              type: 'join',
              collection: 'articles',
              on: 'temples',
              defaultSort: '-date',
              admin: { defaultColumns: ['title', 'author', 'date', '_status'] },
            },
          ],
        },
      ],
    },
    slugField('name'),
    regionField,
    createdByField,
  ],
}
