import type { TempleEntry } from "./types";

/* "The temple" and "The people" on each temple page.

   Short pieces about the place itself — its shrines and images, the
   building, the tank, its stories — and about the people who keep it going:
   priests, sponsoring families, vahana bearers, musicians, stall-keepers.
   These are finished pieces, polished from the field notes. Each is tagged
   with every temple it concerns, so one piece can appear on several temple
   pages. `sources` records the field notes it was written from, for the
   editors — it is not shown on the site.

   People are described by their role. A name appears only with `named`,
   which records their consent — no consent, no name.

   SAMPLES, drafted from the field notes already on the site; nothing is
   added beyond what those notes say. Awaiting approval by Deepa and Arun. */

const DRAFT = { status: "awaiting-approval" as const };
const P = "pondicherry" as const;

const THIRUMANJANAM_NOTE = "2026-04-22-thirumanjanam-varadaraja-perumal";
const PANCHA_VINAYAKA_NOTE = "2026-04-06-pancha-vinayaka-procession";

export const templeEntries: TempleEntry[] = [
  /* ---------------- The temple ---------------- */
  {
    id: "varadaraja-perumal-sanctum",
    region: P,
    topic: "temple",
    temples: ["varadaraja-perumal"],
    title: "The sanctum",
    body: [
      "In the garbhagriha stands the moola Perumal, the main image, which never leaves it. Only the temple's Bhattars perform the puja inside.",
      "At the thirumanjanam of 22 April 2026, watched from the maha mandapam, he was bathed entirely bare, half hidden by the incense smoke. Before him sat his festival image with the consorts; to one side, facing south, Ramanujar.",
    ],
    sources: [THIRUMANJANAM_NOTE],
    editorial: DRAFT,
  },
  {
    id: "varadaraja-perumal-kalasam-shower",
    region: P,
    topic: "temple",
    temples: ["varadaraja-perumal"],
    title: "A shower of kalasam water",
    body: [
      "The temple has a ladle and a plate made for the close of a thirumanjanam: the water from the kalasam, the consecrated pot, is poured through them so that it falls over the images as a shower.",
      "On 22 April 2026 it seemed to go first to the main image, then to the festival images, ending with Ramanujar.",
    ],
    sources: [THIRUMANJANAM_NOTE],
    editorial: DRAFT,
  },

  /* ---------------- The people ---------------- */
  {
    id: "varadaraja-perumal-bhattars",
    region: P,
    topic: "people",
    temples: ["varadaraja-perumal"],
    title: "The Bhattars",
    body: [
      "The temple's priests. Varadaraja Perumal keeps the Vaikhanasa tradition, in which only its Bhattars may perform the main puja.",
      "At the thirumanjanam of 22 April 2026, a Bhattar lit the thattu vilakku to begin, and after every offering showed the dhoop, the arati deepam and the thattu deepam to each of the images.",
    ],
    sources: [THIRUMANJANAM_NOTE],
    editorial: DRAFT,
  },
  {
    id: "ubhayakarar",
    region: P,
    topic: "people",
    temples: ["varadaraja-perumal", "manakkula-vinayakar"],
    title: "The ubhayakarar",
    body: [
      "The family or person who sponsors a day's worship or a festival — its ubhayam — and is honoured in it.",
      "At Varadaraja Perumal on 22 April 2026, the morning began with what seemed to be an archanai for the ubhayakara family, seated in the doorway of the inner prakaram. At Manakkula Vinayakar, the swamis are not taken out in procession until the ubhayakarar is present.",
    ],
    sources: [THIRUMANJANAM_NOTE, PANCHA_VINAYAKA_NOTE],
    editorial: DRAFT,
  },
  {
    id: "vahana-keeper",
    region: P,
    topic: "people",
    temples: ["chetty-kovil", "manakkula-vinayakar"],
    title: "The vahana keeper",
    body: [
      "The gajavahana, the elephant vahana, in Manakkula Vinayakar's Pancha Vinayaka procession on 6 April 2026 belongs to the Chetty Kovil. The man who looks after it told us he manages forty temples, and that they share such things between them freely, at no cost: if a temple asks, they give.",
    ],
    sources: [PANCHA_VINAYAKA_NOTE],
    editorial: DRAFT,
  },
];
