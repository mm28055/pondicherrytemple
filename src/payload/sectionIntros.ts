/* The opening line under the title of each section page on the site
   (Festivals & Rituals, Field Notes, Films, Articles, The Book). The team edits
   them under Site pages → Section descriptions; these are the starting texts,
   and what the site shows if a box is left empty. */

export const SECTION_INTROS = [
  {
    name: 'observances',
    label: 'Festivals & Rituals',
    text: 'The festivals and rituals we have been present for so far. Each is explained once, and gathers every field note and article about it, from every temple where it was seen.',
  },
  {
    name: 'fieldNotes',
    label: 'Field Notes',
    text: 'Everything recorded at the temples — notes written on the day, interviews, videos and photographs. Working material, lightly edited: the raw stuff of everything else on this site.',
  },
  {
    name: 'films',
    label: 'Films',
    text: 'Short films from the temples, newest first. Press one to play it here; each has its own page with the words that go with it.',
  },
  {
    name: 'articles',
    label: 'Articles',
    text: 'Essays and longer writing with a named author: on the temple, its festivals and rituals, and what they mean.',
  },
  {
    name: 'books',
    label: 'The Book',
    text: "Alongside this site, a book is being written from the year's fieldwork. Below is its provisional shape — the parts it may contain. It will change as the writing does.",
  },
] as const

export type SectionName = (typeof SECTION_INTROS)[number]['name']
