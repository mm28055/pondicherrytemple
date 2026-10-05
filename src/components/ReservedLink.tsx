"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

/** A link to a page held in reserve (lib/festivals). The page it is on is
    built ahead, the same for everyone; so it is here, in the visitor's
    browser, that it asks whether they are signed in to the admin. To them
    (and always on this computer) it is a link; to everyone else, the same
    words, unlinked, "(coming soon)". Once published, a link for all. */
export function ReservedLink({
  href,
  published,
  className,
  children,
}: {
  href: string;
  published: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [team, setTeam] = useState(false);
  useEffect(() => {
    if (published) return;
    // ?as=public: the public version, to check it
    if (new URLSearchParams(window.location.search).get("as") === "public") return;
    if (process.env.NODE_ENV === "development") return setTeam(true);
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setTeam(Boolean(j?.user)))
      .catch(() => {});
  }, [published]);

  if (published || team) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <span className={`${className ?? ""} reserved`}>
      {children} <span className="reserved-soon">(coming soon)</span>
    </span>
  );
}
