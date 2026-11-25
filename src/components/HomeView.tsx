import Link from "next/link";
import { Fragment } from "react";
import { DownTo } from "@/components/DownTo";
import {
  countTemplesForObservance,
  getFieldNotesForTemple,
  getHomePage,
  getLatest,
  getObservances,
  getOccasions,
  getOccasionsForObservance,
  getOccasionsForTemple,
  getPhotos,
  getRegion,
  getTemples,
} from "@/lib/data";
import { onePerEvent, STRIP_PHOTOS } from "@/lib/photoPack";
import { articleRow, filmRow, noteRow, observanceRow } from "@/lib/view";
import { ObservanceRow, TempleRow, Where } from "@/components/Rows";
import { TodayTamil } from "@/components/TodayTamil";
import { calendarEvents } from "@/lib/calendarEvents";
import { Html } from "@/components/Prose";
import { HomeStrip } from "@/components/HomeStrip";
import { HomeMark } from "@/components/HomeTamil";
import { plainWithScripts } from "@/lib/richtext";
import { FilmVideo } from "@/components/FilmVideo";
import { ReservedSoonTag } from "@/components/ReservedSoon";
import { getEditableGlobal, isEditing } from "@/lib/editing";
import { HOME_TA, streetTa, templeTa } from "@/content/homeTa";
import { tamilOf } from "@/lib/tamilPages";
import { rowTa } from "@/lib/viewTa";
import { EditRich, EditText } from "@/components/edit/Editable";

/** The home page; with `ta`, in Tamil (its words: content/homeTa), the same
    page otherwise. Its links lead to the English pages until those are translated. */
export async function HomeView({ ta = false }: { ta?: boolean }) {
  const T = ta ? HOME_TA : null;
  const words = await getHomePage();
  // Admin2 (lib/editing): its words as boxes, saved to Site pages → Home page
  const ed = !ta && (await isEditing()) ? await getEditableGlobal("home-page") : null;
  const at = (field: string, label: string) => ({ collection: ed!.collection, id: ed!.id, field, label: `${label} (home page)` });
  const region = (await getRegion("pondicherry"))!;
  const temples = await getTemples(region.id);

  // Just added: the newest things, whatever they are. No upkeep.
  // as many as fit down to the bottom of the film beside them (DownTo), at least four
  const latest = (await getLatest(16)).map((l) => {
    const row =
      l.type === "field-note"
        ? noteRow(l.item, temples, region.calendar)
        : l.type === "film"
          ? filmRow(l.item, temples, region.calendar)
          : articleRow(l.item, region.calendar);
    return ta ? rowTa(row, temples, l.type === "article" ? undefined : l.item) : row;
  });

  const templeRows = await Promise.all(
    // the temples with an introduction written; the rest are on the Temples page
    temples.filter((t) => t.introText).map(async (t) => {
      const occ = (await getOccasionsForTemple(region.id, t.id)).length;
      const notes = (await getFieldNotesForTemple(region.id, t.id)).length;
      if (T) {
        const tamil = { ...t, knownAs: templeTa(t.id, t.knownAs ?? t.name), street: streetTa(t.id, t.street) ?? "" };
        return { t: tamil, meta: T.counts(occ, notes) };
      }
      return { t, meta: `${occ} occasions · ${notes} field note${notes === 1 ? "" : "s"}` };
    })
  );

  // The five festivals and rituals seen most often
  const observances = await Promise.all(
    (await getObservances()).map(async (o) => ({
      row: observanceRow(o, await countTemplesForObservance(o.id)),
      seen: (await getOccasionsForObservance(o.id)).length,
    }))
  );
  const topObservances = observances.sort((a, b) => b.seen - a.seen).slice(0, 5);

  // for the pop-up behind "Today": every day recorded, as the calendar shows it
  const todayEvents = await calendarEvents(await getOccasions(), ta);

  // the strip of photographs under the masthead: one from each of the
  // latest events, the newest first, all of them in turn
  // (only the latest STRIP_PHOTOS events: thousands would weigh the page down)
  const stripPhotos = onePerEvent(await getPhotos(), STRIP_PHOTOS)
    .map(({ id, small, alt, focus, width, height }) => ({ id, small, alt, focus, width, height }));

  const page = (
    <>
      <div className="wrap">
        {/* on a phone, the first screen: the photographs between the name and the date, the rest below it */}
        <div className="home-first">
          <section className="home-hero">
            {/* the name in black letters; the play button at its end opens the film large */}
            <HomeMark film={words?.film} words={T ? { place: T.place, watch: T.watch, watchShort: T.watchShort, close: T.close } : undefined} />
            <TodayTamil events={todayEvents} month ta={ta} />
          </section>

          {stripPhotos.length > 0 && <HomeStrip photos={stripPhotos} all={T?.allPhotos} base={ta ? "/ta/photographs" : undefined} />}
        </div>

        {/* Why the temple matters to a town; the rest of the story is on the About page. */}
        {/* The words are written in the admin: Settings → Home page. */}
        <section className="home-opening">
          <div>
            {ed ? (
              <>
                <EditText as="h1" value={ed.text("headline")} required target={at("headline", "Heading")} />
                <EditRich {...ed.rich("opening")} styles="short" target={at("opening", "Opening")} />
              </>
            ) : T ? (
              <>
                <h1>{T.headline}</h1>
                {T.opening.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </>
            ) : (
              <>
                <h1>{words?.headline}</h1>
                {words?.opening && <Html html={words.opening} />}
              </>
            )}
            {/* the film, after the words: chosen in the admin, Site pages → Home page
                (until there is one, an empty box its size) */}
            {words?.film ? (
              <FilmVideo
                className="home-opening-film"
                src={words.film.src}
                poster={words.film.poster}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="home-opening-film placeholder" aria-hidden="true" />
            )}
          </div>

          {/* Beside the opening, so a returning visitor sees what's new without scrolling */}
          <aside className="home-latest" aria-labelledby="just-added">
            <div className="section-head">
              <h2 id="just-added">{T?.latest ?? "Just added"}</h2>
              <Link className="arrow-link" href="/field-notes">
                {T?.allNotes ?? "All field notes"}
              </Link>
            </div>
            <DownTo target=".home-opening-film" min={4}>
              {latest.map((r) => (
                <Fragment key={r.id}>
                  <Link href={r.href}>
                    <span className="caps">
                      {/* what it is — a film, an article — unless it is a plain field note */}
                      {r.kind !== "note" && <span className="kind">{r.kindLabel} · </span>}
                      {/* the date, each temple and the occasion each kept whole (Unbroken) */}
                      <span className="unbroken">
                        {r.day} {r.shortMonth}
                        {r.where && " ·"}
                      </span>
                      {r.where && (
                        <span className="where">
                          {" "}
                          <Where row={r} />
                        </span>
                      )}
                    </span>
                    <span className="latest-title">{r.title}</span>
                  </Link>
                </Fragment>
              ))}
            </DownTo>
          </aside>
        </section>
      </div>

      {/* The dark band: a quotation (each line of the box on its own line),
          who said it, and optionally a second passage and a link. All set in
          the admin: Site pages → Home page. */}
      {/* Admin2: the band's parts as boxes, each shown (faintly, where empty) to be filled in */}
      {ed && (
        <section className="voice voice-line">
          <div className="wrap">
            <EditText as="div" className="kicker" value={ed.text("quoteLabel")} placeholder="Label over the quotation" target={at("quoteLabel", "Label")} />
            <blockquote>
              <EditText as="div" long value={ed.text("quote")} placeholder="The quotation (each line on its own line)" target={at("quote", "Quotation")} />
            </blockquote>
            <div className="voice-foot">
              <EditText as="div" value={ed.text("quoteBy")} placeholder="By" target={at("quoteBy", "By")} />
            </div>
            <EditText as="p" className="voice-after" long value={ed.text("quoteAfter")} placeholder="A passage after it" target={at("quoteAfter", "Passage after")} />
            <div className="voice-foot">
              <EditText className="arrow-link" value={ed.text("quoteLinkText")} placeholder="Link's words" target={at("quoteLinkText", "Link's words")} />
              <EditText value={ed.text("quoteLink")} placeholder="Link to (/about#idea)" target={at("quoteLink", "Link to")} />
            </div>
          </div>
        </section>
      )}
      {T && (
        <section className="voice voice-line">
          <div className="wrap reveal">
            <blockquote>
              {T.quote.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </blockquote>
            <div className="voice-foot">
              <Link className="arrow-link" href={(words?.quoteLink?.href ?? "/about#why").replace(/^\/about/, "/ta/about")}>
                {T.quoteLink}
              </Link>
            </div>
          </div>
        </section>
      )}
      {!ed && !T && words?.quote && (
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
          <div className="split home-lists">
            <div>
              {/* four temples; the rest a click away, at the end of the list */}
              <div className="section-head">
                <h2>{T?.temples ?? "Temples"}</h2>
              </div>
              {templeRows.slice(0, 4).map(({ t, meta }) => (
                <TempleRow key={t.id} temple={t} meta={meta} href={ta ? tamilOf(`/${t.region}/${t.id}`) : undefined} />
              ))}
              <div className="list-foot">
                <Link className="arrow-link" href={ta ? tamilOf(`/${region.id}`)! : `/${region.id}`}>
                  {T?.allTemples ?? "All temples"}
                </Link>
              </div>
            </div>
            <div>
              <div className="section-head">
                <h2>{T?.festivals ?? "Festivals & Rituals"}</h2>
                <ReservedSoonTag words={T?.soon} />
              </div>
              {topObservances.map(({ row }) => (
                <ObservanceRow key={row.id} row={row} compact />
              ))}
              <div className="list-foot">
                <Link className="arrow-link" href={ta ? "/ta/festivals-and-rituals" : "/festivals-and-rituals"}>
                  {T?.allFestivals ?? "All festivals and rituals"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section tight">
          <div className="band reveal">
            <div>
              {ed ? (
                <>
                  <EditText as="h2" value={ed.text("bookHeading") || "A book is in preparation"} target={at("bookHeading", "Book heading")} />
                  <EditText as="p" value={ed.text("bookText")} placeholder="A line under it" target={at("bookText", "Book line")} />
                </>
              ) : (
                <>
                  <h2>{T?.bookHeading ?? words?.bookHeading ?? "A book is in preparation"}</h2>
                  {T ? <p>{T.bookText}</p> : words?.bookText && <p>{words.bookText}</p>}
                </>
              )}
            </div>
            <Link className="arrow-link" href={`/${region.id}/book`}>
              {T?.bookLink ?? "What it may contain"}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
  // (in Tamil: the Tamil face throughout, site.css, .in-ta)
  return ta ? (
    <div className="in-ta" lang="ta">
      {page}
    </div>
  ) : (
    page
  );
}
