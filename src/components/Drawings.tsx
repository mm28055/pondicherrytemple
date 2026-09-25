import type { Illustration } from "@/content/types";

/** Where the drawings go on a page. A wide first drawing runs across the full
    page above the columns; a tall one (most temple plans) goes at the top of
    the main column, so the side column sits beside it instead of empty space. */
export function drawingsInColumn(items: Illustration[]): boolean {
  return items.length > 0 && items[0].height > items[0].width;
}

/** A page's drawings: the first one large, any others in a row beneath it.
    Renders nothing if there are none. */
export function Drawings({ items }: { items: Illustration[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  return (
    <section className="drawings" aria-label="Drawings">
      <Drawing d={lead} lead />
      {rest.length > 0 && (
        <div className="drawing-row">
          {rest.map((d) => (
            <Drawing key={d.id} d={d} />
          ))}
        </div>
      )}
    </section>
  );
}

function Drawing({ d, lead = false }: { d: Illustration; lead?: boolean }) {
  return (
    <figure className={`drawing${lead ? " lead" : ""}`}>
      <img src={d.src} width={d.width} height={d.height} alt={d.alt} loading={lead ? "eager" : "lazy"} />
      <figcaption>
        <span className="drawing-title">
          {d.title}
          {d.caption && <span className="drawing-caption"> — {d.caption}</span>}
        </span>
        {d.credit && <span className="caps">{d.credit}</span>}
      </figcaption>
    </figure>
  );
}
