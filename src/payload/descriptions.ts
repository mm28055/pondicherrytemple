/* The line of help under each section's name in the admin ("Finished short
   films, such as…"). These are only the starting texts: the team changes them
   under Admin → Section descriptions, and the admin shows whatever is saved
   there (src/components/admin/SectionDescription.tsx). */

export const SECTIONS = [
  { slug: 'field-notes', label: 'Field notes', text: 'Everything recorded at the temples: what happened, in words, photographs and videos.' },
  { slug: 'films', label: 'Films', text: 'Finished short films, such as the Centre’s Instagram reels. New Instagram posts arrive here as drafts every morning.' },
  { slug: 'articles', label: 'Articles', text: 'Essays and finished pieces. Tag a temple or festival only if the article actually discusses it.' },
  { slug: 'media', label: 'Media', text: 'Every photo, video, recording and document. Drag several files in at once to upload them together.' },
  { slug: 'temples', label: 'Temples', text: 'The temples being documented, in the order the site shows them — drag to reorder. Open a temple to edit everything on its page.' },
  { slug: 'temple-pieces', label: 'Temple pieces', text: 'Short finished pieces for the "The temple" and "The people" sections of temple pages, polished from the field notes.' },
  { slug: 'occasions', label: 'Occasions', text: "Every occasion the team was present for. These make each temple's 'year so far', and the 'where we've seen it' list on festival pages." },
  { slug: 'drawings', label: 'Drawings', text: "Abishek's drawings: each temple's illustrated plan, and scenes photographs can't capture. A drawing appears at the top of every temple and festival page it is tagged with." },
  { slug: 'observances', label: 'Festivals & rituals', text: 'Each festival or ritual is explained once. Its page then gathers every temple, date, field note and article tagged with it.' },
  { slug: 'books', label: 'The Book', text: 'The outline shown on The Book page. It will change as the writing does.' },
  { slug: 'users', label: 'Users', text: 'Everyone who can sign in. Admins add people here and choose what they can do.' },
  { slug: 'regions', label: 'Regions', text: 'The towns the project documents. Only Pondicherry for now.' },
  { slug: 'home-page', label: 'Home page', text: 'The words on the home page. The newest additions, temples and festivals shown there fill themselves in. "Save" puts changes on the site.' },
  { slug: 'about-page', label: 'About page', text: 'Everything on the About page. Drag sections to reorder them. "Save" puts changes on the site.' },
  { slug: 'instagram', label: 'Instagram', text: 'New Instagram videos arrive every morning as draft films, marked "awaiting review". Nothing appears on the site until someone checks the temples, festivals and consent, and publishes it.' },
] as const

export type SectionSlug = (typeof SECTIONS)[number]['slug']

/** The field in the Section descriptions page that holds a section's text ("field-notes" → "fieldNotes"). */
export const fieldName = (slug: string) => slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

const description = (slug: SectionSlug) => ({
  path: '/components/admin/SectionDescription#SectionDescription',
  clientProps: { slug },
})

/** For a collection's admin.components: shows its editable description. */
export const describedBy = (slug: SectionSlug) => ({ Description: description(slug) })

/** The same for a global (a single page such as the home page). */
export const globalDescribedBy = (slug: SectionSlug) => ({ elements: { Description: description(slug) } })
