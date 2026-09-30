import type { Field } from 'payload'
import { adminOnlyField } from './access'

/** Turn a title into a web address: "The first day at Chetty Koil" → "the-first-day-at-chetty-koil". */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** The web address of a page. Made from the title (and, for field notes, the
    date) the first time it is saved; after that it stays put, so links keep working. */
export function slugField(from: string, { withDate = false } = {}): Field {
  return {
    name: 'slug',
    type: 'text',
    label: 'Web address',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Made from the title when left empty. Change it only before publishing.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const title = data?.[from]
          if (typeof title !== 'string' || !title.trim()) return value
          const date = withDate && data?.date ? `${String(data.date).slice(0, 10)}-` : ''
          return slugify(date + title) || `item-${Date.now()}`
        },
      ],
    },
  }
}

/** Which region something belongs to. Only Pondicherry for now, so it fills itself in. */
export const regionField: Field = {
  name: 'region',
  type: 'relationship',
  relationTo: 'regions',
  required: true,
  admin: { position: 'sidebar' },
  // The town itself (the first region made), never "In and around …".
  defaultValue: async ({ req }) => {
    const { docs } = await req.payload.find({ collection: 'regions', sort: 'createdAt', limit: 1, depth: 0, req })
    return docs[0]?.id
  },
}

type TagAdmin = { description?: string; width?: string }

/** The tags that put a piece on temple pages. */
export const templesField = (admin: TagAdmin = {}): Field => ({
  name: 'temples',
  type: 'relationship',
  relationTo: 'temples',
  hasMany: true,
  admin: { description: 'Every temple this is about. It will appear on each of their pages.', ...admin },
})

/** The tags that put a piece on festival and ritual pages. */
export const observancesField = (admin: TagAdmin = {}): Field => ({
  name: 'observances',
  label: 'Festivals & rituals',
  type: 'relationship',
  relationTo: 'observances',
  hasMany: true,
  admin: {
    description: 'Every festival or ritual this is about. It will appear on each of their pages.',
    ...admin,
  },
})

/** Who made it — filled in automatically. Lets contributors edit only their own. */
export const createdByField: Field = {
  name: 'createdBy',
  label: 'Added by',
  type: 'relationship',
  relationTo: 'users',
  access: { update: adminOnlyField },
  admin: { position: 'sidebar', readOnly: true },
  hooks: {
    beforeChange: [({ req, operation, value }) => (operation === 'create' && req.user ? req.user.id : value)],
  },
}

/** The team's own record of whether the authors have approved it. Never shown on the site. */
export const reviewField: Field = {
  name: 'review',
  type: 'group',
  label: 'Review',
  admin: { position: 'sidebar' },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'awaiting',
      options: [
        { label: 'Awaiting review', value: 'awaiting' },
        { label: 'Approved', value: 'approved' },
      ],
      admin: { description: "For the team's tracking only. Never shown on the site." },
    },
    { name: 'note', type: 'text', admin: { placeholder: 'e.g. To be checked by T. Ganesan' } },
  ],
}
