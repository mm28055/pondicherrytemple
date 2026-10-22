"use client";

import { useRowLabel } from "@payloadcms/ui";
import { useEffect, useState } from "react";

const names = new Map<number, Promise<string>>();
/** A temple's shortest name, from the admin's own API, once for each temple. */
function shortNameOf(id: number): Promise<string> {
  if (!names.has(id))
    names.set(
      id,
      fetch(`/api/temples/${id}?depth=0&draft=true`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((t) => t?.shortName || t?.knownAs || t?.name || `Temple ${id}`)
        .catch(() => `Temple ${id}`),
    );
  return names.get(id)!;
}

/** The header of a temple's section in a regular repeating ritual: the temple
    (its shortest name), and the ritual's name there where it has its own
    ("Chetty Koil · Parashakti Ul-purappadu"); until a temple is chosen, its
    place in the list. Marked (temple-row-label) for the admin's stylesheet,
    which sets each temple's section apart. */
export function TempleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ temple?: number | { id: number; shortName?: string }; name?: string }>();
  const ref = data?.temple;
  const id = typeof ref === "object" && ref ? ref.id : ref;
  const [temple, setTemple] = useState<string | null>(typeof ref === "object" && ref?.shortName ? ref.shortName : null);
  useEffect(() => {
    if (typeof id !== "number") return setTemple(null);
    let live = true;
    shortNameOf(id).then((n) => live && setTemple(n));
    return () => {
      live = false;
    };
  }, [id]);
  const name = data?.name?.trim();
  return (
    <span className="temple-row-label">
      {temple ?? `Temple ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`}
      {name && <span className="temple-row-label__what"> · {name}</span>}
    </span>
  );
}
