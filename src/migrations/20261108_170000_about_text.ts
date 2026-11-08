import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await aboutTextData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old words are not kept: nothing to put back
}

/* The About page and the home page's dark band, from "ABOUT materials"
   (8 November 2026). The opening line and four sections written over, found
   by their old headings, each keeping its place and link name; any other
   section ("The temple and the town"), the team and the contact untouched.
   On the home page only the band's words; its link stays as it is.
   *word* is set in italics. */

const LEDE =
  'Sthalam is a temple documentation project of the Centre for Shaiva Studies, Pondicherry. Since March 2026, we have been following fifteen of the town’s temples through a full ritual year, and will continue to do so until we have recorded and honored all of the rituals and festivals each temple keeps. The last such record of Pondicherry’s temple culture appeared in a 1961 Census document on “Fairs and Festivals.” Since then, the town has grown, and its priorities are rapidly changing. Sthalam wants to create another baseline to mark what this town’s ritual life has now become, and what it tends towards, and what it will take for us to continue and keep nurturing and growing it.'

const SECTIONS: { old: string; heading: string; paragraphs: string[] }[] = [
  {
    old: 'The project',
    heading: 'The project',
    paragraphs: [
      'The work began on 16 March 2026 at the Chetty Koyil, but the project had seeded itself much before, unbeknownst even to those who would become its scribes. The morning after the Masi moon had grown round and full, two thousand years after Agastya muni kept his asrama in this Vedapuri, a hundred more since the prophesied Uttara yogi arrived in that same spot, as the Gods of the town gathered to bathe in the waters that make their theertham–a slight figure from the North stood in the shimmer of the sun on the sea, a thick book for his meagre chattram.',
      'As he watched Thillai Koothan dance in ocean spray: What is this place? he asked, what are these temples which keep these ways and why is there no record of this magic and these wonders? Too absorbed by the imponderabilia of daily life, too distracted by worldly calls, too disenchanted, too overwhelmed–nobody listened, and so the man laughed, smeared ash on his forehead, and left.',
      'But in that waning dark fortnight, the question lingered like a lone, low cloud in a rainless season. That night, it fell into a dream in which the rishi Vasistha appeared to Deepa (our project lead). The mind-born son of Brahma, in this his second birth as Maitravaruni, twin of Agastya, he had come from Vedapuri, he said, and he was grieved by what he had found there. The shrines were still lit and tended, but only some knew the stories that made them sacred and precious; sthalapuranas were kept, but only by a few; the festivals were bigger but fewer came to meet the processional figures; the temples were many but their raison d’etre questioned. He had served as purohita to the kings of Ayodhya and had watched the yugas turn, and he knew that in the Kali age the Lord’s lila is no less present, only more strewn in fragments.',
      'And so he told her whose heart longed for song and story to gather these memories from the priests, from the stones, and from those who still remember, so that the people of this blurred, confusing, and distracted age, through this monumental effort, might once again celebrate the play the Lord performs in the world as the one true source of themselves.',
      'She asked for help, and it came in the form of a boy named Arunaditya born and named to weave crimson carpets for the Sun, and an artist named Abishek who spoke in ink lines and brushwork. Together they aspire to listen for the stories of Pondicherry’s ritual life which are loud but unheard, visible but unseen, present but unperceived, so that the great rishi could watch and be once again pleased, and the man from the North could return and laugh anew.',
    ],
  },
  {
    old: 'Why these temples',
    heading: 'Why temples, why these temples?',
    paragraphs: [
      'Think of Pondicherry, and chances are you’ll think of its beachfront, “French cafes” and quaint, camera-calling doorways. Chances are you’re lured by colonial romance. It’s far less likely that you’ll pay a thought to the city’s temples, even though some are known to have existed even at the time the French first arrived in 1673. Or to the breathlessly unfolding ritual life this town continues to sustain, which is everywhere visible, audible, pulsating if you pause long enough to feel it, but not always evident simply because it’s being lived and not being sold.',
      'Deepa Reddy and Arunaditya Das have begun a year-long study of the ‘Temples of Pondicherry’. What are their calendars, their rituals, their stories? What sustains them, what world do they still hold together? Our aim is partly to flip to the temples’ view of Pondicherry, to tell the story of this town through the aspirations of its Tamil inhabitants, of Pondicherry as Jnanabhumi, Vedapuri, Siddhar Bhoomi—the site of over 30 Siddhar jeeva samadhis; and partly to come to know this town for the fullness of the Hindu life it lives. These are the lifeways we seek to re-centre lest they should be lost to us, too.',
      'We have picked a group of 15 temples from a pool of over 250, mostly ones within Pondicherry’s famed boulevards. The big shrines and the small ones, temples to Sivan, Perumal and Amman, the ones that have always been there and the ones which have arrived and emerged—they have been chosen as monuments which together represent this town and its religio-spiritual longings. For our temples are not just memory-keepers, they are ways in which the town and its communities seek personal solace, hold their own, make wishes and dream dreams, keep abreast of rapid change, protect what has been so that it may forever endure அங்கும் இங்கும் எங்கும் as Bharatiyar once said: there, here, and everywhere.',
    ],
  },
  {
    old: 'How we work',
    heading: 'How we work',
    paragraphs: [
      'We go to the temples as devotees who happen to carry notebooks and cameras. We ask for permissions, and what we can photograph. We keep track of the noticeboards, record what is to happen and when, and plan our lives around each temple’s events: where to be in the early morning, where to be in the evening, what to get done at mid-day, how to move from temple to temple when a similar moment is being marked in several different places, where to position ourselves so that we can gather it all with richness and fullness, accuracy and precision. Everything begins as a running log kept on the day, and what appears here is only lightly edited from it. What we share with you are our joys, our musings and reflections, our photographs Whatsapped in the hundreds on request, and our sometimes faltering but certainly extended process of learning from all the people we meet. They give us flowers, time, many kindnesses, blessings, pinches of ash, rice flour and turmeric, and kunkumam, and above all ways to think about what we see from within the traditions, not from without. We hope to be their worthy scribes.',
      'Nothing about a living person is published without their consent. A temple’s land, income and governance are part of what we learn, but they are background to our work, not something we publish.',
    ],
  },
  {
    old: 'The name',
    heading: 'The name',
    paragraphs: [
      '*Sthalam* (ஸ்தலம், स्थलम्) — Sanskrit, and in everyday use across the Tamil country and the South — is the tradition’s own word for a sacred site. The Tevaram hymns sort the temples they sing as *padal perra sthalams*, “the sites that received songs.”',
      'But a sthalam is never only a location. Each has its own *sthala purana*, the story of why the deity chose this place; its *sthala vrksa*, its sacred tree; and its *sthala tirtham*, its sacred water. The word merely names what this project documents: not monuments, but a place that is alive.',
    ],
  },
]

const QUOTE =
  'What are the temples’ calendars, what rituals do they perform, what are their stories? What sustains them, what world do they still hold together? Sthalam records and celebrates it all–the temple priest’s esoteric chants and mudras, the bhaktas’ songs and worship, the jubilant roadside ritual re-enactments of profound debates and great mythic victories, and the ways the temples hold them and from which they stream to suffuse the atmosphere of this seaside town.'

const text = (t: string, italic: boolean) => ({
  mode: 'normal', text: t, type: 'text', style: '', detail: 0, format: italic ? 2 : 0, version: 1,
})
const paragraph = (p: string) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0,
  children: p.split('*').map((t, i) => (t ? text(t, i % 2 === 1) : null)).filter(Boolean),
})
const body = (ps: string[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: ps.map(paragraph) },
})

export async function aboutTextData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  const about = (await payload.findGlobal({ slug: 'about-page', depth: 0, req, overrideAccess: true })) as any
  const sections = (about.sections ?? []).map((s: any) => {
    const n = SECTIONS.find((x) => x.old === s.heading || x.heading === s.heading)
    return n ? { ...s, heading: n.heading, body: body(n.paragraphs) } : s
  })
  for (const n of SECTIONS)
    if (!sections.some((s: any) => s.heading === n.heading))
      payload.logger.warn(`About page: no section "${n.old}" found, not written`)
  await payload.updateGlobal({
    slug: 'about-page',
    data: { lede: LEDE, sections } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
  await payload.updateGlobal({
    slug: 'home-page',
    data: { quote: QUOTE } as any,
    req,
    overrideAccess: true,
    depth: 0,
    context: { skipRevalidate: true },
  })
}
