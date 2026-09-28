import type { CollectionConfig } from 'payload'
import { TAMIL_MONTHS } from '../../lib/calendar'
import { isAdmin, isEditor, publishedOrTeam } from '../access'
import { shortEditor } from '../editor'
import { createdByField, reviewField, slugField } from '../fields'
import { draftButtons, previewURL } from '../preview'
import { refreshHooks } from '../revalidate'

export const Observances: CollectionConfig = {
  slug: 'observances',
  labels: { singular: 'Festival or ritual', plural: 'Festivals & rituals' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'tamil', 'kind', '_status'],
    description:
      'Each festival or ritual is explained once. Its page then gathers every temple, date, field note and article tagged with it.',
    preview: previewURL('observances'),
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
          label: 'About',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                {
                  name: 'tamil',
                  type: 'text',
                  label: 'Name in Tamil',
                  admin: { width: '50%', description: 'Shown large at the top of the page.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  type: 'select',
                  required: true,
                  defaultValue: 'festival',
                  options: [
                    { label: 'Festival', value: 'festival' },
                    { label: 'Ritual', value: 'ritual' },
                  ],
                  admin: { width: '25%' },
                },
                {
                  name: 'alsoKnownAs',
                  type: 'text',
                  label: 'Also known as',
                  admin: { width: '75%', placeholder: 'e.g. Kodiyetram' },
                },
              ],
            },
            {
              name: 'gloss',
              type: 'text',
              required: true,
              label: 'In a few words',
              admin: { placeholder: 'e.g. the great annual festival' },
            },
            {
              name: 'months',
              type: 'select',
              hasMany: true,
              label: 'When it falls',
              options: [
                { label: 'All through the year', value: 'year' },
                ...TAMIL_MONTHS.map((m) => ({ label: `${m.name} (${m.span})`, value: m.slug })),
              ],
              admin: {
                description:
                  'The Tamil month or months it usually falls in, for the calendar on the Festivals & rituals page. Months the team saw it in are added by themselves. For rituals done again and again, like Pradosham, choose "All through the year".',
              },
            },
            {
              name: 'about',
              type: 'array',
              label: 'Explanation',
              labels: { singular: 'Question', plural: 'Questions' },
              admin: {
                description:
                  'Questions and answers, in order: "What is it?", "When does it happen?", "What happens?", "What to look for", "In Pondicherry"…',
              },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'richText', editor: shortEditor, required: true },
              ],
            },
          ],
        },
        {
          label: 'Photographs',
          description:
            'Photos tagged with this festival or ritual. "Add new" uploads one already tagged. Photos in its field notes are shown on the page too, without being listed here.',
          fields: [
            {
              name: 'photographs',
              type: 'join',
              collection: 'media',
              on: 'observances',
              where: { mimeType: { contains: 'image' } },
              defaultSort: '-createdAt',
              defaultLimit: 50,
              admin: { defaultColumns: ['filename', 'caption', 'temples', 'consent'] },
            },
          ],
        },
      ],
    },
    slugField('name'),
    reviewField,
    createdByField,
  ],
}
