import Link from "next/link";
import {
  countTemplesForObservance,
  getFieldNotesForTemple,
  getHomePage,
  getLatest,
  getObservances,
  getOccasionsForObservance,
  getOccasionsForTemple,
  getRegion,
  getTemples,
  hasPage,
} from "@/lib/data";
import { articleRow, filmRow, noteRow, observanceRow } from "@/lib/view";
import { ObservanceRow, TempleRow } from "@/components/Rows";
import { TodayTamil } from "@/components/TodayTamil";
import { Html } from "@/components/Prose";
import { plainWithScripts } from "@/lib/richtext";

export default async function HomePage() {
  const words = await getHomePage();
  const region = (await getRegion("pondicherry"))!;
  const temples = await getTemples(region.id);

  // Just added: the newest things, whatever they are. No upkeep.
  const latest = (await getLatest(4)).map((l) =>
    l.type === "field-note"
      ? noteRow(l.item, temples, region.calendar)
      : l.type === "film"
        ? filmRow(l.item, temples, region.calendar)
        : articleRow(l.item, region.calendar)
  );

  const templeRows = await Promise.all(
    temples.filter(hasPage).map(async (t) => {
      const occ = (await getOccasionsForTemple(region.id, t.id)).length;
      const notes = (await getFieldNotesForTemple(region.id, t.id)).length;
      return { t, meta: `${occ} occasions · ${notes} field note${notes === 1 ? "" : "s"}` };
    })
  );

  // The festivals and rituals seen most often
  const observances = await Promise.all(
    (await getObservances()).map(async (o) => ({
      row: observanceRow(o, await countTemplesForObservance(o.id)),
      seen: (await getOccasionsForObservance(o.id)).length,
    }))
  );
  const topObservances = observances.sort((a, b) => b.seen - a.seen).slice(0, 6);

  return (
    <>
      <div className="wrap">
        <section className="home-hero">
          <div className="home-mark">
            <p className="home-tamil" lang="ta">
              ஸ்தலம்
            </p>
            <p className="home-name">
              <span className="home-latin">Sthalam</span>
              <span className="home-gloss">a sacred site</span>
            </p>
          </div>
          <TodayTamil />
        </section>

        {/* Why the temple matters to a town; the rest of the story is on the About page. */}
        {/* The words are written in the admin: Settings → Home page. */}
        <section className="home-opening">
          <div>
            <h1 className={words?.headlineItalic ? "italic" : undefined}>{words?.headline}</h1>
            {words?.opening && <Html html={words.opening} />}
            <Link className="more-link" href="/about#idea">
              About Sthalam
            </Link>
          </div>

          {/* Beside the opening, so a returning visitor sees what's new without scrolling */}
          <aside className="home-latest" aria-labelledby="just-added">
            <div className="section-head">
              <h2 id="just-added">Just added</h2>
              <Link className="arrow-link" href="/field-notes">
                All field notes
              </Link>
            </div>
            <ul>
              {latest.map((r) => (
                <li key={r.id}>
                  <Link href={r.href}>
                    <span className="caps">
                      {/* what it is — a film, an article — unless it is a plain field note */}
                      {r.kind !== "note" && <span className="kind">{r.kindLabel} · </span>}
                      {r.day} {r.shortMonth}
                      {r.where && <span className="where"> · {r.where}</span>}
                    </span>
                    <span className="latest-title">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>

      {/* The dark band: a quotation (each line of the box on its own line),
          who said it, and optionally a second passage and a link. All set in
          the admin: Site pages → Home page. */}
      {words?.quote && (
      <section className="voice voice-line">
        <div className="wrap reveal">
          {words.quoteLabel && <div className="kicker">{words.quoteLabel}</div>}
          <blockquote>
            {words.quote
              .split(/\n+/)
              .filter((line) => line.trim())
              .map((line, i) => (
                <Html key={i} as="p" html={plainWithScripts(line.trim())} />
              ))}
          </blockquote>
          {words.quoteAfter ? (
            <>
              {words.quoteBy && (
                <div className="voice-foot">
                  <cite>{words.quoteBy}</cite>
                </div>
              )}
              <p className="voice-after">{words.quoteAfter}</p>
              {words.quoteLink && (
                <div className="voice-foot">
                  <Link className="arrow-link" href={words.quoteLink.href}>
                    {words.quoteLink.text}
                  </Link>
                </div>
              )}
            </>
          ) : (
            (words.quoteBy || words.quoteLink) && (
              <div className="voice-foot">
                {words.quoteBy && <cite>{words.quoteBy}</cite>}
                {words.quoteLink && (
                  <Link className="arrow-link" href={words.quoteLink.href}>
                    {words.quoteLink.text}
                  </Link>
                )}
              </div>
            )
          )}
        </div>
      </section>
      )}

      <div className="wrap">
        <section className="section">
          <div className="split">
            <div>
              <div className="section-head">
                <h2>Temples</h2>
                <Link className="arrow-link" href={`/${region.id}`}>
                  All temples
                </Link>
              </div>
              {templeRows.map(({ t, meta }) => (
                <TempleRow key={t.id} temple={t} meta={meta} />
              ))}
            </div>
            <div>
              <div className="section-head">
                <h2>Festivals &amp; Rituals</h2>
                <Link className="arrow-link" href="/festivals-and-rituals">
                  All
                </Link>
              </div>
              {topObservances.map(({ row }) => (
                <ObservanceRow key={row.id} row={row} compact />
              ))}
            </div>
          </div>
        </section>

        <section className="section tight">
          <div className="band reveal">
            <div>
              <h2>{words?.bookHeading ?? "A book is in preparation"}</h2>
              {words?.bookText && <p>{words.bookText}</p>}
            </div>
            <Link className="arrow-link" href={`/${region.id}/book`}>
              What it may contain
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
