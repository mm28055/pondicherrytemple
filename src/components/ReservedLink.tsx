"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTeam } from "@/lib/team";

/** A link to a page held in reserve (lib/festivals). The page it is on is
    built ahead, the same for everyone; so it is here, in the visitor's
    browser, that it asks whether they are signed in to the admin (lib/team:
    once for the page, however many links ask). To them
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
  const team = useTeam(!published);

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
