import type { TempleEntry } from "@/content/types";
import { Html } from "./Prose";

/** "The temple" or "The people" on a temple page: short, finished pieces. */
export function Entries({ title, entries }: { title: string; entries: TempleEntry[] }) {
  return (
    <section>
      <h2 className="sub-head">{title}</h2>
      {entries.map((e) => (
        <article key={e.id} className="entry reveal">
          {e.picture && (
            <figure>
              <img
                src={e.picture.src}
                width={e.picture.width}
                height={e.picture.height}
                alt={e.picture.alt}
                loading="lazy"
              />
              {(e.picture.caption || e.picture.credit) && (
                <figcaption>
                  {e.picture.caption}
                  {e.picture.caption && e.picture.credit && " · "}
                  {e.picture.credit}
                </figcaption>
              )}
            </figure>
          )}
          <h3 className="entry-title">{e.title}</h3>
          {e.named && <p className="entry-name caps">{e.named.name}</p>}
          <Html className="entry-body rich" html={e.body} />
        </article>
      ))}
    </section>
  );
}
