"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FESTIVALS_PUBLISHED, festivalPath, isFestivalPath } from "@/lib/festivals";
import { useTeam } from "@/lib/team";

/** A festival's or ritual's name: a link to its page for everyone once the
    pages are published (lib/festivals); until then, a link only for someone
    signed in to the admin, and the same words, unlinked, for everyone else.
    Give it the festival's `id`, or an `href` (any other address is simply a
    link). */
export function FestivalLink({
  id,
  href,
  className,
  title,
  children,
}: {
  id?: string;
  href?: string;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const to = href ?? (id ? festivalPath(id) : "");
  const reserved = !FESTIVALS_PUBLISHED && isFestivalPath(to);
  const team = useTeam(reserved);
  // the same mark, linked or not, so it is laid out the same either way
  const cls = className ? `fl ${className}` : "fl";
  return to && (!reserved || team) ? (
    <Link className={cls} href={to} title={title}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}
