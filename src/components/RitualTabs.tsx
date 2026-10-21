"use client";

import { useId, useState, type ReactNode } from "react";

export type RitualTab = { key: string; ta: string; en: string; count: string; panel: ReactNode };

/** A temple's ritual calendar in three parts, the year, the month and the
    week, chosen at the top: a switch of three, each with its Tamil and
    English name and how many there are, the one shown dark. All three are
    in the page (for those without scripts, and for search); one is shown. */
export function RitualTabs({ tabs }: { tabs: RitualTab[] }) {
  const [on, setOn] = useState(tabs[0]?.key);
  const id = useId();
  return (
    <div className="ritual-tabs">
      <div className="ritual-switch" role="tablist" aria-label="The temple’s ritual calendar">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`${id}-${t.key}`}
            aria-selected={on === t.key}
            aria-controls={`${id}-${t.key}-panel`}
            className={on === t.key ? "on" : undefined}
            onClick={() => setOn(t.key)}
          >
            <span className="ta" lang="ta">
              {t.ta}
            </span>
            <span className="en">{t.en}</span>
            <span className="n">{t.count}</span>
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" id={`${id}-${t.key}-panel`} aria-labelledby={`${id}-${t.key}`} hidden={on !== t.key}>
          {t.panel}
        </div>
      ))}
    </div>
  );
}
