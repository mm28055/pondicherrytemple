"use client";

import { FESTIVALS_PUBLISHED } from "@/lib/festivals";
import { useTeam } from "@/lib/team";

/** " (coming soon)", after the Festivals & Rituals page's introduction, while
    the festivals' own pages are held in reserve (lib/festivals): for the
    public; not for someone signed in to the admin, who can open them. Asked
    in the browser (lib/team), so the page is built ahead, the same for all. */
export function ReservedSoon() {
  const team = useTeam(!FESTIVALS_PUBLISHED);
  return FESTIVALS_PUBLISHED || team ? null : <span className="reserved-soon"> (coming soon)</span>;
}
