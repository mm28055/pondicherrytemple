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
    its rituals in the order of the day, then its photographs, temple by
    temple, then what the day is like (what the town's people do on it). (The photographs are stand-ins until each day's own are added.) */
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
              // a ritual may come more than once in a day: at another temple, or another time
              <li key={`${r.id}|${r.time}|${r.temples.map((t) => t.key).join()}`}>
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

        {/* the day's photographs, temple by temple: one row each, the last a link to all of them */}
        {temples.map((t) =>
          (photos[`${shown}|${t.key}`] ?? []).length > 0 ? (
            <div key={t.key} className="varam-photos">
              <h3 className="caps">{t.name}</h3>
              <PhotoWall photos={photos[`${shown}|${t.key}`]} layout="strip" seeAll={t.href ? `${t.href}/photographs` : "/photographs"} />
            </div>
          ) : null
        )}

        {/* what the day is like: what the town's people do on it, once written
            in the admin (Site pages → Varam); until then nothing */}
        {character[shown]?.trim() && (
          <div className="varam-character">
            <h3 className="caps">{day.en}s</h3>
            {character[shown].split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p.trim()}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
