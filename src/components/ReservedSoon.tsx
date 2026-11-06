"use client";

import Link from "next/link";
import { FESTIVALS_PUBLISHED } from "@/lib/festivals";
import { useTeam } from "@/lib/team";

/** "Coming soon", under the Festivals & Rituals page's title, while the
    festivals' own pages are held in reserve (lib/festivals): for the public;
    not for someone signed in to the admin, who can open them. Asked in the
    browser (lib/team), so the page is built ahead, the same for all. */
export function ReservedSoon() {
  const team = useTeam(!FESTIVALS_PUBLISHED);
  return FESTIVALS_PUBLISHED || team ? null : <p className="coming-soon">Coming soon</p>;
}

/** The page's introduction: `intro`, from the admin (Section descriptions), once
    the festivals' pages can be opened; until then, for the public, these words,
    the way to the field notes meanwhile. */
export function ReservedLede({ intro }: { intro: string }) {
  const team = useTeam(!FESTIVALS_PUBLISHED);
  if (FESTIVALS_PUBLISHED || team) return <p className="page-lede">{intro}</p>;
  return (
    <p className="page-lede">
      The festivals and rituals we were present for, described and explained with all relevant detail, connected to
      our field notes, photographs of the session, and eventually to longer articles and other syntheses. To be
      compiled and published once our full year of field immersion is complete. For now,{" "}
      <Link className="lede-link" href="/field-notes">
        follow our field notes →
      </Link>
    </p>
  );
}
