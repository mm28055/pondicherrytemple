import Link from "next/link";
import { FestivalLink } from "@/components/FestivalLink";
import type { NoteRowData, ObservanceRowData } from "@/lib/view";
import type { Temple } from "@/content/types";
import { DEITY_GROUP_LABELS } from "@/content/labels";

/** A field note, interview, video… or an article: date stamp, then what it is.
    `withPicture` adds its photograph at the right, or a placeholder. */
export function NoteRow({
  row,
  withPicture = false,
}: {
  row: NoteRowData;
  withPicture?: boolean;
}) {
  return (
    <Link
      className={
        withPicture ? "note-row with-picture reveal" : "note-row reveal"
      }
      href={row.href}
    >
      <div className="date-stamp" aria-hidden="true">
        <span className="d">{row.day}</span>
        <span className="m">{row.shortMonth}</span>
        {row.local && <span className="t">{row.local}</span>}
      </div>
      <div>
        <div className="row-meta caps">
          {row.kind !== "note" && (
            <span className="kind">{row.kindLabel} · </span>
          )}
          {row.where}
        </div>
        <h3 className="row-title">{row.title}</h3>
        {withPicture && row.longExcerpt ? (
          <>
            <p className="row-excerpt fill">{row.longExcerpt}</p>
            <span className="row-more">Read more</span>
          </>
        ) : (
          row.excerpt && <p className="row-excerpt">{row.excerpt}</p>
        )}
        {row.by && <p className="row-by">{row.by}</p>}
      </div>
      {withPicture &&
        (row.picture ? (
          <img
            className="row-picture"
            src={row.picture.src}
            alt={row.picture.alt}
            loading="lazy"
          />
        ) : (
          <span className="row-picture empty" aria-hidden="true">
            <span className="caps">Photograph to come</span>
          </span>
        ))}
    </Link>
  );
}

/** A festival or ritual: its Tamil name, its English name and gloss. */
export function ObservanceRow({
  row,
  compact = false,
}: {
  row: ObservanceRowData;
  compact?: boolean;
}) {
  const className = `obs-row reveal${compact ? " compact" : ""}`;
  const inside = (
    <>
      <span className="obs-tamil" lang="ta">
        {row.tamil ?? row.name}
      </span>
      {compact ? (
        <span className="caps">{row.name}</span>
      ) : (
        <>
          <span>
            <span className="obs-name">{row.name}</span>
            <br />
            <span className="obs-gloss">{row.gloss}</span>
          </span>
          <span className="caps">
            {row.seenAt} temple{row.seenAt === 1 ? "" : "s"}
          </span>
        </>
      )}
    </>
  );
  // a link to its page for everyone once the festivals' pages are published;
  // until then, for someone signed in to the admin only
  return (
    <FestivalLink className={className} href={row.href}>
      {inside}
    </FestivalLink>
  );
}

/** A temple with a page. */
export function TempleRow({
  temple: t,
  meta,
}: {
  temple: Temple;
  meta: string;
}) {
  return (
    <Link className="temple-row reveal" href={`/${t.region}/${t.id}`}>
      <div>
        <div className="temple-name">{t.knownAs ?? t.name}</div>
        <div className="temple-sub">
          {t.knownAs ? `${t.name} · ` : ""}
          {DEITY_GROUP_LABELS[t.group]}
          {t.street ? ` · ${t.street}` : ""}
        </div>
      </div>
      <span className="caps">{meta}</span>
    </Link>
  );
}

/** A temple still being documented: listed, not yet linked. */
export function TempleRowPlain({ temple: t }: { temple: Temple }) {
  return (
    <div className="temple-row plain">
      <div>
        <div className="temple-name">{t.knownAs ?? t.name}</div>
        <div className="temple-sub">
          {t.deity}
          {t.street ? ` · ${t.street}` : ""}
        </div>
      </div>
    </div>
  );
}
