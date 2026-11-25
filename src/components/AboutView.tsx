import { getEditableGlobal, isEditing } from "@/lib/editing";
import { EditRich, EditText } from "@/components/edit/Editable";
import Link from "next/link";
import { getAboutPage } from "@/lib/data";
import { Html } from "@/components/Prose";
import { ABOUT_SECTIONS_TA, ABOUT_TA, TEAM_TA } from "@/content/aboutTa";

/** A team bio is plain text; "[Heritage Temples](https://heritagetemples.org)"
    in it becomes a link to that site, opening in a new tab. */
function withLinks(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

/* Everything on this page is written in the admin: Settings → About page.
   Sections keep their "link names" (idea, why), which the home page links to. */
export async function AboutView({ ta = false }: { ta?: boolean }) {
  // in Tamil (/ta/about): the same page, its words from content/aboutTa
  const T = ta ? ABOUT_TA : null;
  const about = await getAboutPage();
  const email = about?.contactEmail;
  // each section with its place in the admin's list (for Admin2's boxes)
  const sections = (about?.sections ?? []).map((s, i) => ({ ...s, i }));
  // Admin2 (lib/editing): its words as boxes, saved to Site pages → About page
  const ed = !ta && (await isEditing()) ? await getEditableGlobal("about-page") : null;
  const at = (field: string, label: string) => ({ collection: ed!.collection, id: ed!.id, field, label: `${label} (About page)` });
  const block = (s: (typeof sections)[number]) => (
    <section key={s.heading} className="about-block" id={s.anchor ?? undefined}>
      {ed ? (
        <>
          <EditText as="h2" value={ed.text(`sections.${s.i}.heading`)} required target={at(`sections.${s.i}.heading`, `${s.heading}: heading`)} />
          <EditRich className="prose rich" {...ed.rich(`sections.${s.i}.body`)} styles="full" target={at(`sections.${s.i}.body`, `${s.heading}: text`)} />
        </>
      ) : (
        <>
          <h2>{(ta && ABOUT_SECTIONS_TA[s.heading]?.heading) || s.heading}</h2>
          <Html className="prose rich" html={(ta && ABOUT_SECTIONS_TA[s.heading]?.body.map((p) => `<p>${p}</p>`).join("")) || s.body} />
        </>
      )}
    </section>
  );

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <header className="page-head landing-head">
        <div className="kicker">{T?.kicker ?? "About"}</div>
        {/* the name in Tamil, as on the home page */}
        <h1 className="page-title page-title-tamil" lang="ta">
          ஸ்தலம்
        </h1>
        {ed ? (
          <EditText as="p" className="page-lede" long value={ed.text("lede")} placeholder="An opening line" target={at("lede", "Opening line")} />
        ) : (
          !ta && about?.lede && <p className="page-lede">{about.lede}</p>
        )}
      </header>

      {sections.filter((s) => s.anchor !== "centre").map(block)}

      <section className="about-block" id="book">
        <h2>{T?.bookHeading ?? "The book"}</h2>
        <div className="prose">
          <p>{T?.book ?? "A book on the temples of Pondicherry is in preparation. Its outline is provisional."}</p>
          <Link className="arrow-link" href="/pondicherry/book">
            {T?.bookLink ?? "The book, in progress"}
          </Link>
        </div>
      </section>

      {/* the section with link name "centre" (The Centre) comes just before the team */}
      {sections.filter((s) => s.anchor === "centre").map(block)}

      {about && about.team.length > 0 && (
        <section className="about-block" id="team">
          <h2>{T?.team ?? "The team"}</h2>
          <ul className="team">
            {about.team.map((en, i) => {
              const p = ta ? { ...en, ...TEAM_TA[en.name] } : en;
              return (ed ? (
                <li key={p.name}>
                  <EditText as="div" className="who" value={ed.text(`team.${i}.name`)} required target={at(`team.${i}.name`, `${p.name}: name`)} />
                  <EditText as="div" className="role caps" value={ed.text(`team.${i}.role`)} placeholder="Role" target={at(`team.${i}.role`, `${p.name}: role`)} />
                  {/* (its links as written in the admin, shown as they are while editing) */}
                  <EditText as="p" long value={ed.text(`team.${i}.bio`)} placeholder="A few lines about them" target={at(`team.${i}.bio`, `${p.name}: bio`)} />
                </li>
              ) : (
                <li key={p.name}>
                  <div className="who">{p.name}</div>
                  {p.role && <div className="role caps">{p.role}</div>}
                  {p.bio && <p>{withLinks(p.bio)}</p>}
                </li>
              ));
            })}
          </ul>
        </section>
      )}

      <section className="about-block" id="contact" style={{ borderBottom: "none", paddingBottom: 96 }}>
        <h2>{T?.contact ?? "Contact"}</h2>
        <div className="prose">
          {ed ? (
            <EditText as="p" long value={ed.text("contactText")} placeholder="A few words on writing to the project" target={at("contactText", "Contact")} />
          ) : (
            about?.contactText && <p>{T?.contactText ?? about.contactText}</p>
          )}
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
