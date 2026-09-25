import Link from 'next/link'

const ACTIONS = [
  { href: '/admin/collections/field-notes/create', label: 'Write a field note' },
  { href: '/admin/collections/media/create', label: 'Upload photos, videos or recordings' },
  { href: '/admin/collections/occasions/create', label: 'Add a date to the year so far' },
  { href: '/admin/collections/articles/create', label: 'Write an article' },
  { href: '/admin/collections/drawings/create', label: 'Add a drawing' },
]

/** The first thing the team sees after signing in. */
export function Welcome() {
  return (
    <div className="sthalam-welcome">
      <h2>The Sthalam workspace</h2>
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
