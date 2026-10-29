import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { spell } from '../lib/spellings'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await setNamesFromNotesData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the names are kept: nothing to undo
}

/* A temple's photo set named by its field note: the occasion of the one
   field note of the same day at one of its temples ("Thulasi Mariamman
   Brahmotsavam Preparatory Pujas", not the folder's "Vinayakar Purappatu for
   Brahmotsavam_Amman"), "Temple Visits" too. Only a set still named as its
   folder named it (or its spelling put right, when brought in): one named
   in the admin is left as it is. A set of two such notes takes the one
   chosen for it below, else is left and listed (in the log) to be chosen; one of none keeps its name, until
   its note comes. Its "Short name" cleared, to be made again from the new
   name. Exported, to be run again as field notes come in (scripts). */

// a set of two such notes, its note chosen (by its occasion)
const CHOSEN: Record<string, string> = {
  'Varadarāja Perumal_Pondicherry/2026-05-01_Davanotsavam (Chithirai Pournami)': 'Davanotsavam Conclusion',
}

// the folders whose names were put right as they were brought in (scripts/import-photos)
const CORRECTED = [
  'Vedapuriswara_Pondicherry/2026-10-27_Kriitikai',
  'Nandhikeswara_Pondicherry/2026-05-16_Amavasay+Krittigai',
  'Varadarāja Perumal_Pondicherry/2026-10-12_Perumal Navatri Day 1',
  'Vedapuriswara_Pondicherry/2026-08-31_Sankatahara Chaturhi',
  'Kāḻattīsvarar Chetty Koyil_Pondicherry/2026-08-31_Sankatahara Chaturhi Shankhabhishekam',
  'Nandhikeswara_Pondicherry/2026-08-31_Sankatahara Chaturhi Shankhabhishekam',
  'Vedapuriswara_Pondicherry/2026-05-31_AM_Natarajar Teerthavari (missed)',
  'Varadarāja Perumal_Pondicherry/2026-10-21_Perumal Navaratri Day 10_Ambu Poduthal (missed) on Kuthirai Vahanam',
  'Vācavi Kannika Paramecuvarī_Pondicherry/2026-10-26_Navaratri Vidaiyatri Day 5_Sayana (verify) Alankaram',
].map((f) => f.normalize('NFC'))

/** The name a folder gave its set (as scripts/import-photos made it). */
function folderName(folder: string) {
  const last = folder.split(' ; ')[0].split('/').pop() ?? ''
  const date = last.match(/^(\d{4}-\d\d-\d\d)/)?.[1]
  return (date ? last.slice(date.length) : last)
    .replace(/^[\s_–-]+/, '')
    .replace(/^ALL[\s_]+/, '')
    .replace(/^(AM|PM)[\s_]+/, '')
    .replace(/\s*_\s*/g, ', ')
    .trim()
}
const loose = (s: string) => spell(s).normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
/** The day in India of a stored date. */
const dayOf = (d?: string | null) => (d ? new Date(new Date(d).getTime() + 5.5 * 3600e3).toISOString().slice(0, 10) : '')
const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

export async function setNamesFromNotesData({ payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>): Promise<{ renamed: string[]; two: string[] }> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const sets = (await payload.find({ collection: 'photo-sets', limit: 5000, pagination: false, joins: false, ...quiet })).docs
  const notes = (await payload.find({ collection: 'field-notes', limit: 5000, pagination: false, draft: false, ...quiet })).docs
  const renamed: string[] = []
  const two: string[] = []
  for (const set of sets) {
    const temples = (set.temples ?? []).map(idOf)
    if (!temples.length || !set.date || !set.folder) continue
    // still as its folder named it (one named in the admin is left)
    const asBrought = loose(set.title) === loose(folderName(set.folder)) || CORRECTED.includes(set.folder.normalize('NFC'))
    if (!asBrought) continue
    const day = dayOf(set.date)
    const chosen = Object.entries(CHOSEN).find(([folder]) => folder.normalize('NFC') === set.folder!.normalize('NFC'))?.[1]
    const ofDay = notes
      .filter((n) => dayOf(n.date) === day && (n.temples ?? []).map(idOf).some((t) => temples.includes(t)))
      .filter((n) => !chosen || n.occasion?.trim() === chosen)
    if (ofDay.length > 1) {
      two.push(`${day} "${set.title}" (${set.folder}): ${ofDay.map((n) => `"${n.occasion?.trim()}"`).join(' or ')}`)
      continue
    }
    const occasion = ofDay[0]?.occasion?.trim().replace(/\s+/g, ' ')
    if (!occasion || occasion === set.title) continue
    await payload.update({ collection: 'photo-sets', id: set.id, data: { title: occasion, short: null }, ...quiet })
    renamed.push(`${day} "${set.title}" → "${occasion}"`)
  }
  for (const line of renamed) payload.logger.info(`set named by its note: ${line}`)
  for (const line of two) payload.logger.info(`set of two notes, to be chosen: ${line}`)
  return { renamed, two }
}
