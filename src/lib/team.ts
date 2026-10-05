"use client";

import { useEffect, useState } from "react";

/* Whether the visitor is one of the team: signed in to the admin (and always
   on this computer, while the site is being worked on). Pages are built
   ahead, the same for everyone, so it is asked here, in the visitor's
   browser; once for the whole page, however many names ask. ?as=public
   answers no, to see the public version. */

let asked: Promise<boolean> | null = null;

function askOnce(): Promise<boolean> {
  if (asked) return asked;
  if (new URLSearchParams(window.location.search).get("as") === "public") return (asked = Promise.resolve(false));
  if (process.env.NODE_ENV === "development") return (asked = Promise.resolve(true));
  asked = fetch("/api/users/me", { credentials: "include" })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => Boolean(j?.user))
    .catch(() => false);
  return asked;
}

/** True once the visitor is known to be one of the team. Asks only when
    `needed` (a page held in reserve is involved). */
export function useTeam(needed = true): boolean {
  const [team, setTeam] = useState(false);
  useEffect(() => {
    if (!needed) return;
    let live = true;
    askOnce().then((t) => live && setTeam(t));
    return () => {
      live = false;
    };
  }, [needed]);
  return team;
}
