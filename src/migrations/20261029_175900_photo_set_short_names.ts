import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "photo_sets" ADD COLUMN IF NOT EXISTS "short" varchar;`)
  await photoSetShortNamesData({ payload, req })
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "photo_sets" DROP COLUMN IF EXISTS "short";`)
}

/* A photo set's occasion in a few words, for the photo viewer ("Short
   name"): for most, made from the title (lib/data, shortOccasion); filled
   in here for the sets whose title starts with something else, a deity or
   a place ("Perumal, Krishna Janmashtami, Uriyadi"). Only where empty.
   Exported for this computer's copy of the database (scripts). */
const SHORT: Record<string, string> = {
  '2026-04–05, Sītā Rāmar Kalyāṇam': 'Sītā Rāmar Kalyāṇam',
  'Perumal, Krishna Janmashtami, Uriyadi': 'Krishna Janmashtami',
  'Krishna Janmashthami, Morning Purappadu and PM Uriyadi': 'Krishna Janmashtami',
  'visit, lovely Daksinamurti': 'Visit',
  'Navashakti Karumari Amman, Friday Sedal': 'Friday Sedal',
  'Senkazhuneer Amman, Chithirai Pournami': 'Chithirai Pournami',
  'Ellaiamman, Tree Marriage': 'Tree Marriage',
  'Ellaiamman, Vedapuriswara Brahmotsavam beginning': 'Ellaiamman Puja',
  'Dhavajavarohanam and Unjal Utsavam, Amman': 'Dhvajavarohanam',
  'Vinayakar Purappatu for Brahmotsavam, Amman': 'Vinayakar Purappadu',
  'Avani Moola and Perumal Pavitrotsavam Day 1 Vastu Shanti': 'Pavitrotsavam Day 1',
  'Annabhishekam and Navaratri Vidaiyatri Day 4 Kamakshi Alankaram': 'Navaratri Vidaiyatri Day 4',
  'Pradosham and Navaratri Vidaiyatri Day 2, Annapoorni Alankaram': 'Navaratri Vidaiyatri Day 2',
  'Mritsangrahanam and Vishvaksena Purappadu, Perumal Brahmotsavam': 'Mritsangrahanam',
  'monthly sankatahara chaturti': 'Sankatahara Chaturthi',
  'Monthly Sankatahara Chaturti Abhishekam': 'Sankatahara Chaturthi',
}
export async function photoSetShortNamesData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const { docs } = await payload.find({ collection: 'photo-sets', where: { title: { in: Object.keys(SHORT) } }, limit: 1000, joins: false, ...quiet })
  for (const set of docs)
    if (!set.short?.trim()) await payload.update({ collection: 'photo-sets', id: set.id, data: { short: SHORT[set.title] }, ...quiet })
}
