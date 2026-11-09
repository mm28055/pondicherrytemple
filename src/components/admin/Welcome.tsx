import Link from 'next/link'
import type { BasePayload } from 'payload'

const ACTIONS = [
  { href: '/admin/collections/field-notes/create', label: 'Write a field note' },
  { href: '/admin/collections/media/create', label: 'Upload photos, videos or recordings' },
  { href: '/admin/collections/occasions/create', label: 'Add a date to the year so far' },
  { href: '/admin/collections/articles/create', label: 'Write an article' },
  { href: '/admin/collections/drawings/create', label: 'Add a drawing' },
]

/** The first thing the team sees after signing in; and the dictionary words
    drafted for words new to the site, while any wait for approval. */
export async function Welcome({ payload }: { payload: BasePayload }) {
  const waiting = (await payload.count({ collection: 'dictionary', where: { status: { equals: 'waiting' } } })).totalDocs
  return (
    <div className="sthalam-welcome">
      <h2>The Sthalam workspace</h2>
      {waiting > 0 && (
        <p className="sthalam-waiting">
          <Link href="/admin/collections/dictionary?where[status][equals]=waiting">
            {waiting === 1 ? '1 dictionary word is' : `${waiting} dictionary words are`} waiting for approval →
          </Link>
          <br />
          Drafted for words new to the site. Edit each if needed and set it to Approved; it then shows on hover.
        </p>
      )}
      <p>
        Everything on the site comes from here. <b>Save draft</b> keeps a piece to yourself while
        you work on it; <b>Publish</b> puts it on the site within a few seconds.
      </p>
      <div className="sthalam-actions">
        {ACTIONS.map((a) => (
          <Link key={a.href} href={a.href}>
            {a.label}
          </Link>
        ))}
      </div>
      <ul className="sthalam-tips">
        <li>
          Tag the temples and festivals a piece is about. That is what puts it on their pages; nothing
          needs linking by hand.
        </li>
        <li>
          Writing a field note or a temple’s introduction: plain letters, no accents, in the site’s
          spellings (Koyil, Siva, Vinayaka). A Tamil or Sanskrit word the Dictionary doesn’t have yet
          gets a drafted meaning at the next update, waiting here for your approval; once approved,
          its meaning shows on hover wherever it is used.
        </li>
        <li>Upload many photos at once by dragging them in together.</li>
        <li>
          Videos: keep the original on your own drive and upload a smaller copy (an MP4 of around
          1080p is plenty).
        </li>
        <li>Photos or recordings of people: note their consent on the file.</li>
        <li>Field notes and articles save as you type, so nothing is lost if the connection drops.</li>
      </ul>
    </div>
  )
}
