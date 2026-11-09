/* On this computer only: adds the dictionary entries Claude drafted for words
   new to the site (from scripts/new-words.ts) to the local Dictionary, as
   "Waiting for approval", for the user to edit and approve in the admin.
     npm run payload -- run scripts/dictionary-drafts.ts
   Reads .data/dictionary-drafts.json: [{ word, alsoWritten?, meaning,
   exactCase?, foundIn }]. A word already in the Dictionary is left as it is.
   Then POST /next/refresh is not needed: a waiting word shows nowhere. */
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
try {
  const drafts = JSON.parse(fs.readFileSync('.data/dictionary-drafts.json', 'utf8')) as any[]
  let added = 0
  for (const d of drafts) {
    const there = await payload.find({ collection: 'dictionary', where: { word: { equals: d.word } }, limit: 1, overrideAccess: true })
    if (there.docs.length) {
      console.log(`  already there: ${d.word}`)
      continue
    }
    await payload.create({
      collection: 'dictionary',
      overrideAccess: true,
      context: { skipRevalidate: true },
      data: { word: d.word, alsoWritten: d.alsoWritten ?? null, meaning: d.meaning, exactCase: !!d.exactCase, foundIn: d.foundIn, status: 'waiting' },
    })
    added++
  }
  console.log(`Added ${added} words, waiting for approval`)
} finally {
  process.exit(0)
}
