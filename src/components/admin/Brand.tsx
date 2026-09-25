/* The admin wears the site's temple-wall stripes. */

function Stripes({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#a8321e" />
      <rect x="8" width="8" height="32" fill="#f5f4f0" />
      <rect x="24" width="8" height="32" fill="#f5f4f0" />
    </svg>
  )
}

/** On the sign-in page. */
export function Logo() {
  return (
    <div className="sthalam-logo">
      <Stripes size={44} />
      <div>
        <div className="word">Sthalam</div>
        <div className="ta" lang="ta">
          ஸ்தலம்
        </div>
      </div>
    </div>
  )
}

/** In the navigation. */
export function Icon() {
  return <Stripes size={24} />
}
