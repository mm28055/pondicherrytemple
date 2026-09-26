import { getPayload, type Payload, type SanitizedConfig } from 'payload'
import { toLexical } from './lexical'

/* The Home and About pages' words as they were written into the site's code,
   copied into the admin word for word. Only fills a page that is still
   empty, so nothing edited in the admin is ever overwritten.

   Deepa's note ("Why these temples") keeps her wording: it was shortened and
   lightly adjusted for flow with Manish's agreement (Sept 2026). */

const OPENING_1 =
  'At the heart of every town is a temple, and at the heart of the temple a small dark <em>garbhagriha</em> where the deity dwells in the light of a lamp. Around that <em>garbhagriha</em> the town arranges its life. The temple wakes up before the people do; it rings the hours and marks the seasons; it feeds its people, and gathers them for festivals; it holds what they cannot carry alone. As long as the lamp burns, the town knows who it is.'

const PILOT =
  'Sthalam sets out to unearth this pulsating life, hidden in plain sight. We begin with Pondicherry, our pilot: since March 2026, a small team from the Centre for Shaiva Studies has been following dozens of its temples, large and small, through a full ritual year.'

const home = {
  headline: 'The temple is the soul of every town',
  opening: toLexical([OPENING_1, PILOT]),
  quote:
    'What are their calendars, their rituals, their stories? What sustains them, what world do they still hold together?',
  quoteBy: '— Deepa Reddy, anthropologist · May 2026',
  bookHeading: 'A book is in preparation',
  bookText: "Written from the year's fieldwork, with illustrated plans of each temple.",
}

const about = {
  lede: "A temple documentation project of the Centre for Shaiva Studies, Pondicherry. Since March 2026 we have been following fifteen of the town's temples through a full ritual year. test",
  sections: [
    {
      heading: 'The temple and the town',
      anchor: 'idea',
      body: toLexical([
        OPENING_1,
        "The temple keeps the town's hidden history: which communities came, settled and built its shrines, and which streets its processions still walk. Much of it was never written down. It survives in the rituals themselves, performed again each year, and in the memories of the priests and devotees who keep them. Each festival is the town remembering itself.",
        PILOT,
      ]),
    },
    {
      heading: 'The project',
      body: toLexical([
        "The work began on 16 March 2026 at the Chetty Kovil, and builds on reports T. Ganesan prepared on the town's temples in 2019. It follows each temple through its year: the daily and monthly rites, the great festivals, the people who keep it going.",
        'What we record falls into two broad kinds. There is what a temple <em>is</em> — its architecture, its images, its history, its ritual framework and its lore. And there is what a temple <em>does</em> — its priests and devotees, its food and music and crafts, its place in the life of the streets around it. The first can be measured and checked; the second can only be learned by returning, again and again.',
      ]),
    },
    {
      heading: 'Why these temples',
      anchor: 'why',
      body: toLexical([
        "Think of Pondicherry, and chances are you'll think of its beachfront, “French cafes” and quaint, camera-calling doorways. Chances are you're lured by colonial romance. It's far less likely that you'll pay a thought to the city's temples, even though some are known to have existed even at the time the French first arrived in 1673. Or to the breathlessly unfolding ritual life this town continues to sustain, which is everywhere visible, audible, pulsating if you pause long enough to feel it, but not always evident simply because it's being lived and not being sold.",
        "Arunaditya and I have begun a year-long study of the “Temples of Pondicherry,” under the auspices of the Centre for Shaiva Studies. What are their calendars, their rituals, their stories? What sustains them, what world do they still hold together? Our aim is partly to flip to the temples' view of Pondicherry, to tell the story of this town through the aspirations of its Tamil inhabitants, of Pondicherry as Jnanabhumi, Vedapuri, Siddhar Bhoomi—the site of over 30 Siddhar jeeva samadhis; and partly to come to know this town for the fullness of the Hindu life it lives.",
        'These are the lifeways we seek to re-centre lest they should be lost to us, too.',
        '— Deepa Reddy, anthropologist · May 2026',
      ]),
    },
    {
      heading: 'How we work',
      body: toLexical([
        'We go to the temples as devotees who happen to carry notebooks and cameras. Everything begins as a running log kept on the day, and what appears here is edited from it.',
        "Nothing about a living person is published without their consent. A temple's land, income and governance are part of what we learn, but they are background to our work, not something we publish.",
      ]),
    },
    {
      heading: 'The name',
      body: toLexical([
        "<em>Sthalam</em> (ஸ்தலம், स्थलम्) — Sanskrit, and in everyday use across the Tamil country and the South — is the tradition's own word for a sacred site. The Tēvāram hymns sort the temples they sing as <em>pāḍal peṟṟa sthalams</em>, “the sites that received songs.”",
        'But a sthalam is never only a location. Each has its own <em>sthala purāṇa</em>, the story of why the deity chose this place; its <em>sthala vṛkṣa</em>, its sacred tree; and its <em>sthala tīrtham</em>, its sacred water. The word already names what this project documents: not a monument, but a place that is alive.',
      ]),
    },
  ],
  // Team bios are drafts, to be confirmed by each person.
  team: [
    {
      name: 'Deepa Reddy',
      role: 'Lead researcher',
      bio: "Anthropologist. Leads the fieldwork in Pondicherry's temples and is writing the book that will come from it.",
    },
    {
      name: 'Arunaditya',
      role: 'Research associate',
      bio: "Fieldwork and archival research, and keeper of the project's running log of every visit.",
    },
    {
      name: 'T. Ganesan',
      role: 'Senior scholar',
      bio: 'French Institute of Pondicherry, and Director of the Centre for Shaiva Studies. Guides the Āgamic and historical work.',
    },
    {
      name: 'Manish Maheshwari',
      role: 'Project lead',
      bio: 'Initiated the project, and looks after its framework and this website.',
    },
    {
      name: 'Abishek P.',
      role: 'Illustrator',
      bio: 'Drawing the illustrated plan of each temple, and the scenes photographs cannot capture.',
    },
  ],
  contactText:
    'If you know one of these temples well — or have memories, photographs or documents of them — we would be glad to hear from you.',
  contactEmail: 'manishmaheswari@gmail.com',
}

export async function seedPages(payload: Payload) {
  const options = { overrideAccess: true, context: { skipRevalidate: true } } as const
  const current = await payload.findGlobal({ slug: 'home-page', ...options })
  if (!current.headline) {
    await payload.updateGlobal({ slug: 'home-page', data: home, ...options })
    payload.logger.info('Home page filled in.')
  }
  const aboutNow = await payload.findGlobal({ slug: 'about-page', ...options })
  if (!aboutNow.lede) {
    await payload.updateGlobal({ slug: 'about-page', data: about, ...options })
    payload.logger.info('About page filled in.')
  }
}

/** Called by `payload seed-pages` (see `bin` in payload.config.ts). */
export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config })
  try {
    await seedPages(payload)
  } finally {
    await payload.destroy()
  }
  process.exit(0)
}
