import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* The ritual day of the fifteen temples (8 November 2026, from "The ritual day
   for all temples"): each temple's puja ("4 kaalam puja") and its kalams, or
   its text; shown as The Day in Ritual Cycles. Four new columns for the puja
   and the text before and after the kalams; then, for each temple whose day
   is still empty, its day written. A temple with anything of its day already
   written is left as it is. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "temples" ADD COLUMN IF NOT EXISTS "day_standard" varchar;
  ALTER TABLE "temples" ADD COLUMN IF NOT EXISTS "day_intro" varchar;
  ALTER TABLE "temples" ADD COLUMN IF NOT EXISTS "day_notes_heading" varchar;
  ALTER TABLE "temples" ADD COLUMN IF NOT EXISTS "day_notes" varchar;
  ALTER TABLE "_temples_v" ADD COLUMN IF NOT EXISTS "version_day_standard" varchar;
  ALTER TABLE "_temples_v" ADD COLUMN IF NOT EXISTS "version_day_intro" varchar;
  ALTER TABLE "_temples_v" ADD COLUMN IF NOT EXISTS "version_day_notes_heading" varchar;
  ALTER TABLE "_temples_v" ADD COLUMN IF NOT EXISTS "version_day_notes" varchar;`)
  await ritualDaysData({ payload, req })
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "temples" DROP COLUMN IF EXISTS "day_standard";
  ALTER TABLE "temples" DROP COLUMN IF EXISTS "day_intro";
  ALTER TABLE "temples" DROP COLUMN IF EXISTS "day_notes_heading";
  ALTER TABLE "temples" DROP COLUMN IF EXISTS "day_notes";
  ALTER TABLE "_temples_v" DROP COLUMN IF EXISTS "version_day_standard";
  ALTER TABLE "_temples_v" DROP COLUMN IF EXISTS "version_day_intro";
  ALTER TABLE "_temples_v" DROP COLUMN IF EXISTS "version_day_notes_heading";
  ALTER TABLE "_temples_v" DROP COLUMN IF EXISTS "version_day_notes";`)
}

type K = { kalam: string; tamil?: string; time?: string; timingNote?: string; whatHappens?: string; naivedyam?: string }
type Day = { dayStandard: string; dayIntro?: string; ritualDay?: K[]; dayNotesHeading?: string; dayNotes?: string }

const KS = { kalam: 'Kaalasandhi', tamil: 'காலசந்தி' }
const US = { kalam: 'Upasandhi', tamil: 'உபசந்தி' }
const UK = { kalam: 'Uchikaalam', tamil: 'உச்சிக்காலம்' }
const SR = { kalam: 'Sayaraksha', tamil: 'சாயரட்சை' }
const AJ = { kalam: 'Ardhajaamam', tamil: 'அர்த்தஜாமம்' }

/** Each temple's day, by its web address. */
export const RITUAL_DAYS: Record<string, Day> = {
  'manakkula-vinayakar': {
    dayStandard: '4 kaalam puja',
    dayIntro: 'Abhishekam for Vinayaka, the main deity, every day at all four kaalams.',
    ritualDay: [
      { ...KS, time: '6.30–8am', naivedyam: 'Venpongal' },
      {
        ...UK,
        time: '11am–12 noon',
        whatHappens: 'At 11am the sphatika linga is worshipped, every day, with special worship on Pradosham and Mahasivaratri.',
        naivedyam: 'Dadhyannam, or curd rice\nFor the sphatika linga: shuddhannam, cooked rice with ghee',
      },
      { ...SR, time: '5.30–6.30pm', naivedyam: 'Kesari or tamarind rice' },
      {
        ...AJ,
        time: '9pm',
        whatHappens:
          'The Palliyarai utsavam, every night: the padukas of Vinayaka are carried from the garbhagriha to the palliyarai. Here the goddess in the palliyarai is Parvati: Vinayaka comes to his mother’s bedchamber at night to sleep.',
        naivedyam: 'Samba rice with pepper, milagu sadam',
      },
    ],
  },
  'kamakshi-amman': {
    dayStandard: '4 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: '6.30–7.30am',
        whatHappens: 'Abhishekam and sandhi puja: a simple water abhishekam every morning, and on special days a full abhishekam with milk as well.',
        naivedyam: 'Upma or pongal',
      },
      { ...UK, time: '12 noon', whatHappens: 'Deeparadhanai and annadanam', naivedyam: 'Kalanda sadam, or mixed rice' },
      { ...SR, time: '6.30pm', whatHappens: 'Deeparadhanai', naivedyam: 'Upma or pongal' },
      { ...AJ, time: '9pm', whatHappens: 'Deeparadhanai', naivedyam: 'Milk' },
    ],
  },
  vedapuriswara: {
    dayStandard: '4 kaalam puja',
    dayIntro: 'Abhishekam and aradhanai at every kaalam.',
    ritualDay: [
      {
        ...KS,
        time: '6am',
        whatHappens: 'Thirupalliyezhuchi: the Palliyarai Swami (Vedapuriswara every day, with Tripurasundari on Mondays) is brought in a palanquin to the main sannadhi.',
        naivedyam: 'Shuddhannam, offered to every deity, going clockwise around the temple',
      },
      { ...UK, time: '11am', naivedyam: 'Shuddhannam' },
      { ...SR, time: '6pm', naivedyam: 'Shuddhannam' },
      { ...AJ, time: '9pm', whatHappens: 'With the Palliyarai utsavam', naivedyam: 'Samba milagu sadam, or pepper rice; milk' },
    ],
  },
  mutthumariamman: {
    dayStandard: '1 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: 'At opening',
        whatHappens: 'Nityapadi: paal abhishekam, by the Periya Pusari (Gnanavel). His assistant does the archanai in the evening.',
        naivedyam: 'Shuddhannam, from the Muraikar’s house',
      },
    ],
  },
  'ghousika-balasubramaniar': {
    dayStandard: '1 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: 'At opening',
        whatHappens: 'A water abhishekam and new vastram for every murti, every day; a full abhishekam for the Moolavar alone.',
        naivedyam: 'Shuddhannam',
      },
    ],
  },
  manimutthumariamman: {
    dayStandard: '1 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: 'Before 10am',
        whatHappens: 'A water abhishekam and new vastram every day; a full abhishekam only on Fridays, at noon.',
        naivedyam: 'Shuddhannam\nOn Fridays at lunchtime, annadanam with mixed rice, vegetable biriyani among them',
      },
    ],
  },
  'manonmani-mariamman': {
    dayStandard: '1 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: 'Before 10am',
        whatHappens: 'A water abhishekam every day. The priest comes twice a day, morning and evening, but in practice it is only archanai, for passers-by who come.',
        naivedyam: 'Shuddhannam',
      },
      { ...SR, time: '6pm' },
    ],
  },
  'siva-subramania-lawspet': {
    dayStandard: '4 kaalam puja',
    ritualDay: [
      { ...KS, time: '5–6am', whatHappens: 'Abhishekam, alankaram, deeparadhanai', naivedyam: 'Shuddhannam' },
      {
        ...UK,
        time: '12–1pm',
        whatHappens: 'Abhishekam, alankaram and aradhanai for the sphatika linga, with honey, milk, chandanam and panneer, manjal (abhisheka podi) and shuddhannam',
        naivedyam: 'Thayir sadam, or curd rice',
      },
      { ...SR, time: '5–6pm', whatHappens: '7pm, viniyogam', naivedyam: 'Mixed rice' },
      {
        ...AJ,
        time: '8–9pm',
        whatHappens: '9pm: the Moolavar, the unjal aradhanai for the utsavar, then Bhairava and Chandikeswara',
        naivedyam: 'Paal and pazham (milk and fruits)',
      },
    ],
  },
  'varadaraja-perumal': {
    dayStandard: '4 kaalam puja',
    dayIntro:
      'Puja at all four kaalams, and each time the naivedyam is shuddhannam. Other foods are made only for special occasions. In the past, this shuddhannam, given out afterwards as prasadam, was an important source of food for those serving the temple; now that rice is plentiful, it has lost that meaning.\nThirumanjanam for Perumal only on occasions, sponsored by ubhayakaras.',
  },
  'chetty-koil': {
    dayStandard: '5 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: '6.30–8am',
        whatHappens:
          '6am, Thirupalliyezhuchi: the Palliyarai Swami (Kalathiswara every day, with Gnanambal on Fridays) is brought in a palanquin to the main sannadhi.\n7am, abhishekam with five things for Swami and Ambal: yennai (oil), paal (milk), abhisheka podi (a mixed powder for abhishekam), manja podi (turmeric powder) and maa podi (rice flour). Every other deity receives a jala, or water, abhishekam only.',
      },
      {
        ...US,
        time: '8.30–10am',
        timingNote: 'Breakfast time',
        whatHappens: 'Archanai, deeparadhanai',
        naivedyam: '9am, shuddhannam, offered in turn to Suryan, Vinayaka, Parameswaran, all in the parivaram, Parvati, Bhairava, Chandikeswara and the bali',
      },
      { ...UK, time: '11am–12 noon', whatHappens: 'Abhishekam for Kalathiswara alone; alankaram, puja, deeparadhanai', naivedyam: 'Shuddhannam' },
      { ...SR, time: '6pm', whatHappens: 'Abhishekam, alankaram, deeparadhanai', naivedyam: 'Shuddhannam; thayir sadam, or curd rice' },
      {
        ...AJ,
        time: '8.45–9.15pm',
        timingNote: 'Also called Raathri kaalam',
        whatHappens:
          'Milk abhishekam only, for Swami and Ambal.\nThe Palliyarai utsavam: the Palliyarai Swami is returned to the bedchamber, and naivedyam is then offered to Chandikeswara and Bhairava.',
        naivedyam: '9pm, samba milagu sadam\nPaal and pazham (milk and fruits)',
      },
    ],
  },
  'sundara-vinayakar': {
    dayStandard: '1 kaalam puja',
    dayIntro:
      'In the mornings, and the naivedyam is shuddhannam. Vinayaka receives a very simple alankaram.\nMore kaalam pujas may be done on special occasions, with naivedyams prepared for them.',
  },
  'angala-parameswari': {
    dayStandard: '4 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: '7am',
        timingNote: 'When the temple opens',
        whatHappens: 'Full abhishekam, alankaram and deeparadhanai. Every deity of the temple gets a water abhishekam and new vastram.',
        naivedyam: '9am, mahanaivedyam: shuddhannam',
      },
      { ...UK, time: '12 noon', naivedyam: 'Thayir sadam (curd rice)' },
      { ...SR, time: '6pm', whatHappens: 'Deeparadhanai', naivedyam: 'None' },
      { ...AJ, time: '9pm', naivedyam: 'Milk, from the community, bought by the temple' },
    ],
  },
  nandhikeswara: {
    dayStandard: '2 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: '7am',
        whatHappens: 'Paal abhishekam, a simple alankaram and deeparadhanai for Gangai Vinayaka, the samadhi swami, and Siddheswara and Siddheswari. Every other deity a water abhishekam.',
        naivedyam: 'Shuddhannam',
      },
      { ...SR, time: '6pm', naivedyam: 'Shuddhannam' },
    ],
    dayNotesHeading: 'The nityapadi pujai',
    dayNotes:
      'A simple paal-thanni abhishekam: first for Gangai Vinayakar next door (1 kaalam puja in both temples), then the samadhi below, followed by the vrushabha (Nandi) outside, the beeja mantra, the bali, the Vinayaka at the base and the Vinayaka at the gate, and finally Siddheswara and Siddheswari. Only Gangai Vinayakar, the Guru and the Moolamurti receive milk and water abhishekams; all others water only.\nMore abhishekams are done only on special occasions, and then the alankaram can be elaborate. Pujas with sodasha upacharam, showing all the deepams, happen on special days (Pradosham, Krittikai, Navaratri and others), in the evenings around 6.30–7.30pm.',
  },
  'draupadi-amman': {
    dayStandard: '1 kaalam puja',
    dayIntro: 'A milk and water abhishekam, and the naivedyam is shuddhannam. Full abhishekams are done on special days, usually just once.',
  },
  'kanniga-parameswari': {
    dayStandard: '4 kaalam puja',
    ritualDay: [
      {
        ...KS,
        time: '6am',
        whatHappens: 'An abhishekam with five litres of milk, alankaram and deeparadhanai',
        naivedyam: 'Kalkandu and paal, offered first and given out\nThayir sadam, or curd rice',
      },
      { ...UK, time: '10am', whatHappens: 'Deeparadhanai', naivedyam: 'Shuddhannam' },
      { ...SR, time: '6pm', whatHappens: 'Deeparadhanai', naivedyam: 'Sundal, coconut, fruits' },
      { ...AJ, time: '9pm', whatHappens: 'Deeparadhanai', naivedyam: 'Paal and pazham, and usually sundal as well' },
    ],
  },
}

export async function ritualDaysData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>) {
  for (const [slug, day] of Object.entries(RITUAL_DAYS)) {
    const [t] = (await payload.find({ collection: 'temples', where: { slug: { equals: slug } }, depth: 0, limit: 1, req, overrideAccess: true })).docs as any[]
    if (!t) {
      payload.logger.warn(`ritual day: no temple ${slug}`)
      continue
    }
    if (t.dayStandard || t.dayIntro || t.dayNotes || (t.ritualDay ?? []).length) {
      payload.logger.info(`ritual day: ${slug} already has its day, left as it is`)
      continue
    }
    await payload.update({
      collection: 'temples',
      id: t.id,
      data: { ritualDay: [], dayIntro: null, dayNotesHeading: null, dayNotes: null, ...day } as any,
      req,
      overrideAccess: true,
      depth: 0,
      context: { skipRevalidate: true },
    })
    payload.logger.info(`ritual day: ${slug} written`)
  }
}
