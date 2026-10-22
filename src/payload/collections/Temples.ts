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
    // in the admin, everywhere a temple is chosen or listed: its shortest name
    useAsTitle: 'shortName',
    defaultColumns: ['knownAs', 'name', 'shortName', 'deityGroup', 'street', '_status'],
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
          description: 'Its three names, its deity, its street and its introduction. A temple gets its own page once it has an introduction.',
          fields: [
            // Its three names: the one it is called by (shown large, as its name),
            // the formal one, and the shortest, for where there is little room.
            {
              type: 'row',
              fields: [
                {
                  name: 'knownAs',
                  type: 'text',
                  label: 'Name (semi-formal)',
                  required: true,
                  admin: {
                    width: '34%',
                    placeholder: 'e.g. Chetty Koyil',
                    description: 'What it is called: its name in large letters, everywhere on the site. The same as the formal name, if it has no other.',
                  },
                },
                {
                  name: 'name',
                  type: 'text',
                  label: 'Formal name',
                  required: true,
                  admin: {
                    width: '33%',
                    placeholder: 'e.g. Kalatthiswara Koyil',
                    description: 'Its full, formal name: in smaller letters under its name on the Temples page and on its own page (when the two differ).',
                  },
                },
                {
                  name: 'shortName',
                  type: 'text',
                  label: 'Shortest name',
                  required: true,
                  admin: {
                    width: '33%',
                    placeholder: 'e.g. Chetty Koil',
                    description: 'For where there is very little room: the boxes of the month calendars, and the temples above field notes on a phone.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                // the deity as it used to be written out (no longer asked for; what was written is kept)
                { name: 'deity', type: 'text', admin: { hidden: true } },
                {
                  name: 'deityGroup',
                  label: 'Deity',
                  type: 'select',
                  required: true,
                  options: Object.entries(DEITY_GROUP_LABELS).map(([value, label]) => ({ value, label })),
                  admin: {
                    width: '50%',
                    description: 'Recorded, not shown on the site: for sorting and filtering (as in the Photographs page’s “Deity” filter).',
                  },
                },
                { name: 'street', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'faces',
              label: 'Faces',
              type: 'select',
              defaultValue: 'east',
              options: [
                { label: 'East', value: 'east' },
                { label: 'North', value: 'north' },
                { label: 'South', value: 'south' },
                { label: 'West', value: 'west' },
              ],
              admin: {
                width: '50%',
                description: 'The way its entrance (or its deity) faces: East, unless it is otherwise. The placeholder layout, until its own is drawn, is turned to match.',
              },
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
            'The pieces on this temple’s "The Temple and its Stories" page: History, The place, The people, Stories and Songs. Click one to edit it; "Add new" makes one already tagged with this temple.',
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
          description:
            "Abishek's drawings for this temple. Drag them (by the handle at the left of each row) into the order of the stack of layouts at the top of its page: the first on top.",
          fields: [
            {
              name: 'drawings',
              type: 'join',
              collection: 'drawings',
              on: 'temples',
              // dragged into order here: the stack's order on the temple's page
              orderable: true,
              admin: { defaultColumns: ['title', 'kind', 'image', '_status'] },
            },
          ],
        },
        {
          label: 'Photographs',
          description:
            'Photos tagged with this temple. "Add new" uploads one already tagged. Photos in its field notes are shown on the page too, without being listed here.',
          fields: [
            {
              name: 'photographs',
              type: 'join',
              collection: 'media',
              on: 'temples',
              where: { mimeType: { contains: 'image' } },
              defaultSort: '-createdAt',
              defaultLimit: 50,
              admin: { defaultColumns: ['filename', 'caption', 'observances', 'featured', 'consent'] },
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
    {
      name: 'listed',
      type: 'checkbox',
      label: 'Listed on the Temples page',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Untick to leave the temple off the Temples page (its own page, and everything tagged with it, stay).',
      },
    },
    createdByField,
  ],
}
