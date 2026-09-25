import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="stripes tall" aria-hidden="true" />
      <div className="wrap">
        <div className="footer-inner">
          <div>
            <span className="brand-word">Sthalam</span>
            <span className="brand-tamil" lang="ta">
              ஸ்தலம்
            </span>
            <p>
              The temple is the soul of every town. Sthalam unearths the temple life hidden in
              plain sight, beginning with Pondicherry. A project of the Centre for Shaiva Studies.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/pondicherry">Temples</Link></li>
              <li><Link href="/festivals-and-rituals">Festivals &amp; Rituals</Link></li>
              <li><Link href="/field-notes">Field Notes</Link></li>
              <li><Link href="/articles">Articles</Link></li>
              <li><Link href="/films">Films</Link></li>
            </ul>
          </div>
          <div>
            <h4>The project</h4>
            <ul>
              <li><Link href="/pondicherry/book">The Book</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/about#team">The team</Link></li>
              <li><Link href="/about#contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Sthalam · sthalam.org</span>
          <span>Centre for Shaiva Studies, Pondicherry</span>
        </div>
      </div>
    </footer>
  );
}
