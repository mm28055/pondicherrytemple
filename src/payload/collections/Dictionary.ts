import type { CollectionConfig } from 'payload'
import { isAdmin, isEditor } from '../access'
import { refreshHooks } from '../revalidate'

/* The words explained on the site: on a field note, the first use of each is
   marked, and its meaning shown when the word is hovered over (on a phone,
   tapped). A new or changed entry shows on every note. */
export const Dictionary: CollectionConfig = {
  slug: 'dictionary',
  labels: { singular: 'Dictionary word', plural: 'Dictionary' },
  admin: {
    group: 'Temple pages',
    useAsTitle: 'word',
    defaultColumns: ['word', 'alsoWritten', 'meaning'],
    description:
      'Words explained in the field notes. The first use of each word in a note is underlined, and its meaning appears on hover, or on a tap on a phone.',
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
  ],
}
