import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor } from '../access'
import { refreshHooks } from '../revalidate'

/* The words explained on the site: in a field note or a temple's introduction,
   the first use of each is marked, and its meaning shown when the word is
   hovered over (on a phone, tapped). A new or changed entry shows everywhere.
   Words new to the site are drafted by Claude after each "load latest"
   (scripts/new-words.ts) and wait here until approved; until then they show
   nowhere. */
export const Dictionary: CollectionConfig = {
  slug: 'dictionary',
  labels: { singular: 'Dictionary word', plural: 'Dictionary' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'word',
    defaultColumns: ['word', 'meaning', 'status', 'foundIn'],
    description:
      'Words explained in the field notes and the temples’ introductions. The first use of each word is underlined, and its meaning appears on hover, or on a tap on a phone. A word marked “Waiting for approval” is a draft for a word new to the site: edit it if needed, then set it to Approved.',
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isAdmin },
  hooks: refreshHooks,
  fields: [
    { name: 'word', type: 'text', label: 'Word', required: true, unique: true, admin: { description: 'As it should appear at the top of the card.' } },
    {
      name: 'alsoWritten',
      type: 'text',
      label: 'Also written',
      admin: { description: 'Other forms that should show this meaning, separated by commas: alankara for alankaram. Plurals in s are found without being listed.' },
    },
    { name: 'meaning', type: 'textarea', label: 'Meaning', required: true },
    {
      name: 'exactCase',
      type: 'checkbox',
      label: 'Only with these capitals',
      admin: { description: 'For a word that is something else without its capital: Thai, the month, and not thai in thai saadam.' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'approved',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Waiting for approval', value: 'waiting' },
      ],
      admin: { position: 'sidebar', description: 'Shown on the site only once Approved.' },
    },
    {
      name: 'foundIn',
      type: 'text',
      label: 'Found in',
      admin: { position: 'sidebar', description: 'Where the word was first found, when it was drafted.' },
    },
  ],
}
