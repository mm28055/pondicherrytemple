/* On this computer only, after every "load latest": the words in the temples'
   introductions and the field notes' text (the text the dictionary marks) that
   are neither in the Dictionary nor in scripts/words-reviewed.txt (words
   already looked at and found to need no entry: English, names).
     npm run payload -- run scripts/new-words.ts
   Writes .data/new-words.json: each word, how often it is used, and where
   first. Claude reads it, drafts an entry for each Tamil or Sanskrit word
   (Dictionary, "Waiting for approval") and adds the rest to words-reviewed.txt.
   Reads only. */
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const o = { overrideAccess: true, depth: 0, limit: 5000 } as const

const textOf = (node: any): string => {
  if (!node || typeof node !== 'object') return ''
  if (typeof node.text === 'string') return node.text
  const kids = node.root?.children ?? node.children
  return Array.isArray(kids) ? kids.map(textOf).join(' ') : ''
}
// words in plain letters, with their hyphens and apostrophes; never Tamil script
const wordsOf = (s: string) => s.match(/[A-Za-z]+(?:[-'’][A-Za-z]+)*/g) ?? []

try {
  const known = new Set<string>()
  for (const d of (await payload.find({ collection: 'dictionary', ...o })).docs as any[]) {
    for (const f of [d.word, ...String(d.alsoWritten ?? '').split(',')]) {
      const w = String(f ?? '').trim().toLowerCase()
      if (w) for (const part of [w, ...w.split(/[ -]/)]) known.add(part)
    }
  }
  const reviewed = new Set(
    fs
      .readFileSync('scripts/words-reviewed.txt', 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim().toLowerCase().replace(/’/g, "'"))
      .filter((l) => l && !l.startsWith('#')),
  )
  const isKnown = (w: string) => {
    const l = w.toLowerCase().replace(/’/g, "'")
    const forms = [l, l.replace(/'s$/, ''), l.replace(/s$/, ''), l.replace(/es$/, '')]
    return forms.some((f) => known.has(f) || reviewed.has(f))
  }

  const found = new Map<string, { word: string; uses: number; where: string }>()
  const look = (text: string, where: string) => {
    for (const w of wordsOf(text)) {
      if (isKnown(w)) continue
      const key = w.toLowerCase()
      const f = found.get(key)
      if (f) f.uses++
      else found.set(key, { word: w, uses: 1, where })
    }
  }
  for (const t of (await payload.find({ collection: 'temples', ...o })).docs as any[])
    look(textOf(t.intro), `${t.name}: introduction`)
  for (const n of (await payload.find({ collection: 'field-notes', ...o })).docs as any[])
    look(textOf(n.body), `Field note: ${n.title}`)

  const list = [...found.values()].sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()))
  fs.writeFileSync('.data/new-words.json', JSON.stringify(list, null, 1))
  console.log(`${list.length} words not yet looked at; .data/new-words.json`)
} finally {
  process.exit(0)
}
