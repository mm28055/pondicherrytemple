import type { CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin, isLoggedIn, roleOf } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    group: 'Admin',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    description: 'Everyone who can sign in. Admins add people here and choose what they can do.',
  },
  // Stay signed in for two weeks, so no one is logged out mid-writing.
  auth: { tokenExpiration: 60 * 60 * 24 * 14 },
  access: {
    read: isLoggedIn,
    create: isAdmin,
    update: ({ req }) =>
      roleOf(req) === 'admin' ? true : req.user ? { id: { equals: req.user.id } } : false,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      // The first account is the admin; after that, new people start as contributors.
      defaultValue: async ({ req }) => {
        const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
        return totalDocs === 0 ? 'admin' : 'contributor'
      },
      options: [
        { label: 'Admin — everything, including the team', value: 'admin' },
        { label: 'Editor — writes, uploads and publishes', value: 'editor' },
        { label: 'Contributor — writes drafts; an editor publishes them', value: 'contributor' },
      ],
      access: { create: adminOnlyField, update: adminOnlyField },
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      // The very first person to sign up becomes the admin.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
        return totalDocs === 0 ? { ...data, role: 'admin' } : data
      },
    ],
  },
}
