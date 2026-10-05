/* The elements of the mahotsavam, in three parts: before it begins; its
   defining elements; its concluding events. Each part a list of rites. */
export const MAHOTSAVAM_PARTS: { id: string; title: string; mark: string; rites: string[] }[] = [
  {
    id: "before",
    mark: "Before the Mahotsavam",
    title: "Before the Mahotsavam Begins",
    rites: ["Anugnai", "Vigneswara Puja", "Vastu Shanti Puja", "Mritsangrahanam", "Ankurarpanam"],
  },
  {
    id: "defining",
    mark: "The Defining Elements",
    title: "The Defining Elements",
    rites: ["Dhvajarohanam", "Processions", "Thirukalyanam", "Rathotsavam", "Teerthavari", "Dhvajavarohanam"],
  },
  {
    id: "concluding",
    mark: "Concluding Events",
    title: "Vidaiyaatri, Concluding Events",
    rites: ["Theppotsavam", "Unjal Utsavam", "Mutthupalakku Madaveethi Purappadu", "Shankhabhishekam"],
  },
];

/** A sequence of numbers between 0 and 1 that looks random but is always the
    same for the same name: so a dummy choice made with it does not change
    from one visit to the next. */
export function seeded(name: string): () => number {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** A dummy strip for a rite: between 0 and 21 photographs, picked from those
    given, the number and the choice random but fixed by the rite's name. */
export function dummyStrip<T>(rite: string, from: T[]): T[] {
  const r = seeded(rite);
  const count = Math.min(from.length, Math.floor(r() * 22));
  const pool = [...from];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
