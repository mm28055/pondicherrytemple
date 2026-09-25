import Link from "next/link";
import type { NoteRowData, ObservanceRowData } from "@/lib/view";
import type { Temple } from "@/content/types";
import { DEITY_GROUP_LABELS } from "@/content/labels";

/** A field note, interview, video… or an article: date stamp, then what it is. */
export function NoteRow({ row }: { row: NoteRowData }) {
  return (
    <Link className="note-row reveal" href={row.href}>
      <div className="date-stamp" aria-hidden="true">
        <span className="d">{row.day}</span>
        <span className="m">{row.shortMonth}</span>
        {row.local && <span className="t">{row.local}</span>}
      </div>
      <div>
        <div className="row-meta caps">
          {row.kind !== "note" && <span className="kind">{row.kindLabel} · </span>}
          {row.where}
        </div>
        <h3 className="row-title">{row.title}</h3>
        {row.excerpt && <p className="row-excerpt">{row.excerpt}</p>}
        <p className="row-by">{row.by}</p>
      </div>
    </Link>
  );
}

/** A festival or ritual: its Tamil name, its English name and gloss. */
export function ObservanceRow({ row, compact = false }: { row: ObservanceRowData; compact?: boolean }) {
  return (
    <Link className={`obs-row reveal${compact ? " compact" : ""}`} href={row.href}>
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
    </Link>
  );
}

/** A temple with a page. */
export function TempleRow({ temple: t, meta }: { temple: Temple; meta: string }) {
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
