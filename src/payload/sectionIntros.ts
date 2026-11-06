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
    text: 'Everything recorded at the temples — notes written on the day, interviews, photographs, sometimes also video. This is all working material, only lightly edited: the impressionistic raw material of our day-to-day interactions, things as we first saw them, our first experiential and thinking material. In this, we share also some preliminary interpretations and methods, how we went about doing what we did on a day-to-day basis.',
  },
  {
    name: 'films',
    label: 'Films',
    text: 'The temples in motion: deities carried through the streets, rites performed at dawn, and the people who keep them going. Sometimes also ideas and stories we found in our journeyings through the temple and its utsavams, and the new insights to which they led us. Unless otherwise stated, these have all been filmed, edited, narrated, and produced by Deepa Reddy and Arunaditya Das.',
  },
  {
    name: 'articles',
    label: 'Articles',
    text: 'Essays and longer writings with named authors: on the temple, its festivals and rituals, and what they mean. Some of these writings are our own, others may be archival material we have found particularly insightful in illuminating Indian temple traditions and culture.',
  },
  {
    name: 'books',
    label: 'The Book',
    text: "Alongside this site, a book is being written from the year's fieldwork. Below is its provisional shape — the parts it may contain. It will change as the writing does.",
  },
] as const

export type SectionName = (typeof SECTION_INTROS)[number]['name']
