import type { GlobalConfig } from 'payload'
import { adminOnlyField, isAdmin, isEditor } from '../access'

/* The link to the Centre's Instagram account. Once a key is pasted here, new
   posts are brought in every morning as draft films (see
   src/instagram/import.ts), to be checked, tagged and published by hand. */

export const Instagram: GlobalConfig = {
  slug: 'instagram',
  label: 'Instagram',
  admin: {
    group: 'Admin',
    description:
      'New Instagram videos arrive every morning as draft films, marked "awaiting review". ' +
      'Nothing appears on the site until someone checks the temples, festivals and consent, and publishes it.',
  },
  access: { read: isEditor, update: isAdmin },
  fields: [
    {
      name: 'token',
      type: 'text',
      label: 'Access key',
      access: { read: adminOnlyField },
      admin: {
        description:
          'From the Meta developer app: Instagram → API setup with Instagram login → Generate access tokens. ' +
          'It lasts 60 days; each import renews it, so it only needs pasting once.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'account', type: 'text', label: 'Account', admin: { readOnly: true, width: '50%' } },
        {
          name: 'lastRun',
          type: 'date',
          label: 'Last checked',
          admin: { readOnly: true, width: '50%', date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    { name: 'lastResult', type: 'text', label: 'What happened', admin: { readOnly: true } },
    { name: 'tokenRenewed', type: 'date', admin: { hidden: true } },
    // Every post ever brought in, so a note deleted in the admin is not brought back.
    { name: 'imported', type: 'json', defaultValue: [], admin: { hidden: true } },
  ],
}
