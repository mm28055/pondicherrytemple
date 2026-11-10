import { getFieldNotes, getRegions, getRegularRituals, getTemples } from "@/lib/data";
import { NAKSHATRAS } from "@/lib/nakshatraNames";

/* A field note whose occasion is a nakshatram ("Poosa Nakshatram", "Poosam")
   opens a card gathering that nakshatram's observances: each temple that keeps
   a ritual on it every month (from Settings → Regular rituals), what it is,
   and the field notes on it there; then any other notes on it. Asked for in
   the third Database Log (9 November 2026), for Poosam first. Only when some
   temple keeps a monthly ritual on that nakshatram. */

export type NakshatraCardRow = {
  temple: { name: string; href: string | null };
  what?: string;
  about?: string;
  time?: string;
  tbc?: boolean;
  notes: { href: string; title: string; date: string }[];
};
export type NakshatraCardData = { k: number; name: string; tamil: string; rows: NakshatraCardRow[] };

const low = (s: string) => s.trim().toLowerCase();
/** The ways an occasion may name it: "Poosam", "Poosa Nakshatram", "Poosam Nakshatram". */
function forms(k: number): string[] {
  const n = NAKSHATRAS[k];
  return [n.name, n.shown].filter((x): x is string => !!x).flatMap((x) => [x, `${x} Nakshatram`, `${x.replace(/m$/, "")} Nakshatram`]).map(low);
}
const nakshatraOf = (occasion: string) => NAKSHATRAS.findIndex((_, k) => forms(k).includes(low(occasion)));

export async function getNakshatraCard(occasion: string): Promise<NakshatraCardData | null> {
  const k = nakshatraOf(occasion ?? "");
  if (k < 0) return null;
  const names = [NAKSHATRAS[k].name, NAKSHATRAS[k].shown].filter(Boolean).map((x) => low(x!));
  const rituals = (await getRegularRituals()).filter((r) => r.often === "monthly" && names.includes(low(r.on)));
  if (!rituals.length) return null;

  const notes = (await getFieldNotes()).filter((n) => forms(k).includes(low(n.occasion ?? "")));
  const note = (n: (typeof notes)[number]) => ({ href: `/field-notes/${n.id}`, title: n.title?.trim() || n.occasion, date: n.date });

  const rows: NakshatraCardRow[] = [];
  const placed = new Set<string>();
  for (const r of rituals)
    for (const t of r.temples) {
      // a ritual's temple is "region/slug", a note's its slug
      const here = notes.filter((n) => n.temples.includes(t.key.split("/").pop()!));
      here.forEach((n) => placed.add(n.id));
      rows.push({ temple: { name: t.name, href: t.href }, what: r.what, about: r.about, time: r.time || undefined, tbc: r.tbc, notes: here.map(note) });
    }

  // notes on it at a temple with no monthly ritual on it: under their first temple
  const rest = notes.filter((n) => !placed.has(n.id));
  if (rest.length) {
    const temples = (await Promise.all((await getRegions()).map((g) => getTemples(g.id)))).flat();
    for (const n of rest) {
      const t = temples.find((x) => x.id === n.temples[0]);
      const name = t ? (t.knownAs ?? t.name) : "Pondicherry";
      const row = rows.find((x) => !x.what && x.temple.name === name);
      if (row) row.notes.push(note(n));
      else rows.push({ temple: { name, href: t ? `/${t.region}/${t.id}` : null }, notes: [note(n)] });
    }
  }
  // "Poosa Nakshatram", as the notes write it
  const name = (NAKSHATRAS[k].shown ?? NAKSHATRAS[k].name).replace(/m$/, "");
  return { k, name, tamil: NAKSHATRAS[k].tamil, rows };
}
