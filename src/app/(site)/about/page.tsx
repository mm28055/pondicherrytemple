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

  return (
    <div className="wrap">
      <header className="page-head">
        <div className="kicker">About</div>
        <h1 className="page-title">Sthalam</h1>
        {about?.lede && <p className="page-lede">{about.lede}</p>}
      </header>

      {about?.sections.map((s) => (
        <section key={s.heading} className="about-block" id={s.anchor}>
          <h2>{s.heading}</h2>
          <Html className="prose rich" html={s.body} />
        </section>
      ))}

      <section className="about-block" id="book">
        <h2>The book</h2>
        <div className="prose">
          <p>A book on the temples of Pondicherry is in preparation. Its outline is provisional.</p>
          <Link className="arrow-link" href="/pondicherry/book">
            The book, in progress
          </Link>
        </div>
      </section>

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
          <div className="home-links">
            {email && (
              <a
                className="arrow-link"
                href={`mailto:${email}?subject=Sthalam%20%E2%80%94%20Temple%20Documentation%20Project`}
              >
                Write to the project
              </a>
            )}
            <Link className="arrow-link" href="/field-notes">
              Start with the field notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
