"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FestivalLink } from "@/components/FestivalLink";
import { PhotoWall } from "@/components/PhotoWall";
import type { Photo } from "@/content/types";
import type { WeeklyRitual } from "@/lib/data";

const DAYS = [
  { key: "sun", en: "Sunday", short: "Sun", ta: "ஞாயிறு" },
  { key: "mon", en: "Monday", short: "Mon", ta: "திங்கள்" },
  { key: "tue", en: "Tuesday", short: "Tue", ta: "செவ்வாய்" },
  { key: "wed", en: "Wednesday", short: "Wed", ta: "புதன்" },
  { key: "thu", en: "Thursday", short: "Thu", ta: "வியாழன்" },
  { key: "fri", en: "Friday", short: "Fri", ta: "வெள்ளி" },
  { key: "sat", en: "Saturday", short: "Sat", ta: "சனி" },
];

/* Until a day's character is written in the admin (Site pages → Varam):
   placeholder text, about five hundred words, plainly not the real thing. */
const PLACEHOLDER = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
  "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas faucibus mollis interdum, cras mattis consectetur purus sit amet fermentum, donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper, aenean lacinia bibendum nulla sed consectetur.",
  "Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec sed odio dui, etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nulla vitae elit libero, a pharetra augue.",
  "Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Etiam porta sem malesuada magna mollis euismod. Aenean eu leo quam, pellentesque ornare sem lacinia quam venenatis vestibulum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
].join("\n\n");

/** When in the day, as minutes, to put a day's rituals in order: "3:30 pm
    onwards", "after 7:30 pm", "5 pm"; "morning", "evening", "night" by
    their usual hours; anything else last. */
function minutesOf(time: string): number {
  const t = time.toLowerCase();
  const m = t.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[3] === "pm" || (!m[3] && /evening|night|afternoon/.test(t))) h += 12;
    return h * 60 + Number(m[2] ?? 0);
  }
  if (/morning|dawn|sunrise/.test(t)) return 6 * 60;
  if (/noon|midday/.test(t)) return 12 * 60;
  if (/afternoon/.test(t)) return 15 * 60;
  if (/evening|sunset/.test(t)) return 18 * 60;
  if (/night/.test(t)) return 20 * 60;
  return 24 * 60;
}

/** Varam: what the temples do every week. The seven days in a strip, the
    day it is today marked; one day open at a time, today to begin with:
    its rituals in the order of the day, then what the day is like (what
    the town's people do on it), then its photographs, temple by temple. (The photographs are stand-ins until each day's own are added.) */
export function WeeklyRituals({
  rituals,
  photos,
  character,
}: {
  rituals: WeeklyRitual[];
  photos: Record<string, Photo[]>;
  /** what each day is like, as written in the admin (sun…sat) */
  character: Record<string, string>;
}) {
  // today, in India; worked out in the browser, as the page is built ahead of time
  const [today, setToday] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const day = new Date().toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Kolkata" }).toLowerCase().slice(0, 3);
    setToday(day);
    setOpen((o) => o ?? day);
  }, []);
  const shown = open ?? "sun";
  const on = rituals.filter((r) => r.days.includes(shown)).sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
  // the day's temples, each once, in the order they first come in the day
  const temples = [...new Map(on.flatMap((r) => r.temples).map((t) => [t.key, t])).values()];
  const day = DAYS.find((d) => d.key === shown)!;

  return (
    <div className="varam">
      <div className="varam-days" role="tablist" aria-label="Days of the week">
        {DAYS.map((d) => (
          <button
            key={d.key}
            role="tab"
            aria-selected={d.key === shown}
            className={`varam-day${d.key === today ? " is-today" : ""}`}
            onClick={() => setOpen(d.key)}
          >
            <span lang="ta">{d.ta}</span>
            <span className="caps">{d.short}</span>
            {d.key === today && <span className="varam-today">Today</span>}
          </button>
        ))}
      </div>

      <div className="varam-open" role="tabpanel" aria-label={day.en}>
        {on.length > 0 ? (
          <ul className="varam-list">
            {on.map((r) => (
              <li key={r.id}>
                <span className="varam-time">{r.time}</span>
                <span className="varam-what">
                  {r.what}
                  {r.temples.length > 0 && (
                    <span className="varam-temples">
                      {" · "}
                      {r.temples.map((t, i) => (
                        <span key={t.key}>
                          {i > 0 && ", "}
                          {t.href ? <Link href={t.href}>{t.name}</Link> : t.name}
                        </span>
                      ))}
                    </span>
                  )}
                  {r.observances.length > 0 && (
                    <span className="cal-tags">
                      {r.observances.map((o) => (
                        <FestivalLink key={o.id} id={o.id}>
                          {o.name}
                        </FestivalLink>
                      ))}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="varam-none">Nothing recorded yet for {day.en}s.</p>
        )}

        {/* what the day is like: what the town's people do on it */}
        <div className="varam-character">
          <h3 className="caps">{day.en}s</h3>
          {(character[shown] ?? PLACEHOLDER).split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p.trim()}</p>
          ))}
        </div>

        {/* the day's photographs, temple by temple */}
        {temples.map((t) =>
          (photos[`${shown}|${t.key}`] ?? []).length > 0 ? (
            <div key={t.key} className="varam-photos">
              <h3 className="caps">{t.name}</h3>
              <PhotoWall photos={photos[`${shown}|${t.key}`]} layout="strip" />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
