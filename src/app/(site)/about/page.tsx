import type { Metadata } from "next";
import Link from "next/link";
import { getAboutPage } from "@/lib/data";
import { Html } from "@/components/Prose";

export const metadata: Metadata = {
  title: "About",
  description: "About Sthalam, a temple documentation project of the Centre for Shaiva Studies, Pondicherry.",
};

/* Everything on this page is written in the admin: Settings → About page.
   Sections keep their "link names" (idea, why), which the home page links to. */
export default async function AboutPage() {
  const about = await getAboutPage();
  const email = about?.contactEmail;
  const sections = about?.sections ?? [];
  const block = (s: (typeof sections)[number]) => (
    <section key={s.heading} className="about-block" id={s.anchor ?? undefined}>
      <h2>{s.heading}</h2>
      <Html className="prose rich" html={s.body} />
    </section>
  );

  return (
    <div className="wrap">
      <header className="page-head landing-head">
        <div className="kicker">About</div>
        {/* the name in Tamil, as on the home page */}
        <h1 className="page-title page-title-tamil" lang="ta">
          ஸ்தலம்
        </h1>
        {about?.lede && <p className="page-lede">{about.lede}</p>}
      </header>

      {sections.filter((s) => s.anchor !== "centre").map(block)}

      <section className="about-block" id="book">
        <h2>The book</h2>
        <div className="prose">
          <p>A book on the temples of Pondicherry is in preparation. Its outline is provisional.</p>
          <Link className="arrow-link" href="/pondicherry/book">
            The book, in progress
          </Link>
        </div>
      </section>

      {/* the section with link name "centre" (The Centre) comes just before the team */}
      {sections.filter((s) => s.anchor === "centre").map(block)}

      {about && about.team.length > 0 && (
        <section className="about-block" id="team">
          <h2>The team</h2>
          <ul className="team">
            {about.team.map((p) => (
              <li key={p.name}>
                <div className="who">{p.name}</div>
                {p.role && <div className="role caps">{p.role}</div>}
                {p.bio && <p>{p.bio}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="about-block" id="contact" style={{ borderBottom: "none", paddingBottom: 96 }}>
        <h2>Contact</h2>
        <div className="prose">
          {about?.contactText && <p>{about.contactText}</p>}
          {email && (
            <a
              className="contact-email"
              href={`mailto:${email}?subject=Sthalam%20%E2%80%94%20Temple%20Documentation%20Project`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
                <path d="M3.5 6.5 12 13l8.5-6.5" />
              </svg>
              {email}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
