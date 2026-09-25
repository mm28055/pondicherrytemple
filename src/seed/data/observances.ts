import type { Observance } from "./types";

/* Festivals and rituals that appear in the team's records so far.

   Explainers (`about`) are DRAFTS: general, well-established facts, plus
   details the team actually observed (each such detail comes from the
   running log, via occasions.ts and fieldNotes.ts). To be checked by
   T. Ganesan and replaced or corrected by Deepa and Arun. An observance
   without an explainer still gets a page: where we've seen it, and the notes. */

const DRAFT = {
  status: "awaiting-approval" as const,
  note: "Draft explainer — to be checked by T. Ganesan",
};

export const observances: Observance[] = [
  /* ---------------- Festivals ---------------- */
  {
    id: "brahmotsavam",
    kind: "festival",
    name: "Brahmotsavam",
    tamil: "பிரம்மோற்சவம்",
    gloss: "the great annual festival",
    about: [
      {
        q: "What is it?",
        a: "A temple's principal festival of the year: some ten days during which the deity's festival images, the utsava murtis, are taken out morning and evening, each time on a different vahana.",
      },
      {
        q: "When does it happen?",
        a: "Once a year, in a month fixed by each temple's own tradition. In Pondicherry we followed it at the Chetty Kovil in Panguni, and at Varadaraja Perumal and Vedapuriswara in Vaikasi.",
      },
      {
        q: "What happens?",
        a: "It opens with the dhvajarohanam, the hoisting of the temple flag, and builds day by day through processions, the divine wedding and, at some temples, the pulling of the chariot — before closing with the teerthavari, the sacred bath, and the lowering of the flag.",
      },
      {
        q: "What to look for",
        a: "On the first morning at the Chetty Kovil: rice balls offered as bali around the flagstaff, and the small astra murti waiting on a stool beside it — the one that will be taken to the sea on the last day.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "theppa-utsavam",
    kind: "festival",
    name: "Theppa utsavam",
    tamil: "தெப்ப உற்சவம்",
    gloss: "the float festival",
    about: [
      {
        q: "What is it?",
        a: "A festival on water. The deity's festival images, usually with the consorts, are seated on a theppam — a raft decked with flowers and lights — and taken around a temple tank, usually after dark.",
      },
      {
        q: "When does it happen?",
        a: "Once a year, in a month set by each temple's own tradition, and sometimes over several nights. In Pondicherry we saw it at Varadaraja Perumal on 9 April 2026.",
      },
      {
        q: "What happens?",
        a: "The images are carried down to the water and settled on the float, which is drawn slowly around the tank, circuit after circuit — pulled by ropes from the banks or pushed by men in the water — while the nadaswaram plays and people watch from the steps.",
      },
      {
        q: "What to look for",
        a: "How the float is built — often a platform lashed over empty drums, with a small pavilion on top for the deities — and its lamps, doubled in the water.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "davana-utsavam",
    kind: "festival",
    name: "Davana utsavam",
    tamil: "தவன உற்சவம்",
    alsoKnownAs: "Damanotsavam",
    gloss: "the festival of the davanam plant",
    about: [
      {
        q: "What is it?",
        a: "A spring festival in which the deity is worshipped with davanam — a small herb, Artemisia pallens, grown for its fragrance. Its Sanskrit name is damanaka, hence the festival's other name, Damanotsavam.",
      },
      {
        q: "What happens?",
        a: "Davanam is offered to the deity: woven into garlands, and used in the archanai — the recitation of the deity's names, with an offering for each. It is an old festival, described in the Agamas, the texts that govern temple worship.",
      },
      {
        q: "What to look for",
        a: "The scent. Davanam is prized for its smell rather than its looks, and sprigs of it are often added to garlands.",
      },
      {
        q: "In Pondicherry",
        a: "At Varadaraja Perumal it closed on Chitra Pournami, the full moon of Chithirai — 1 May 2026 — with a homam and a veethi ula, a procession through the streets.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "ramanuja-utsavam",
    kind: "festival",
    name: "Ramanuja utsavam",
    tamil: "ராமானுஜர் உற்சவம்",
    gloss: "the festival of the saint Ramanuja",
    about: [
      {
        q: "What is it?",
        a: "The festival of Ramanuja (traditionally 1017–1137), the teacher whose philosophy, Vishishtadvaita, shaped the Sri Vaishnava tradition. Remembered also as Udaiyavar and Emperumanar, he has his own shrine and his own festival in many Vishnu temples of the Tamil country.",
      },
      {
        q: "When does it happen?",
        a: "At his birth star, Thiruvathirai, in the month of Chithirai (April–May). Some temples keep a festival of several days that ends on the star itself.",
      },
      {
        q: "What happens?",
        a: "His image is bathed, adorned and taken out in procession. The Ramanuja Nootrandhadi — a hundred and eight verses in his praise, part of the Divya Prabandham — is often recited.",
      },
      {
        q: "In Pondicherry",
        a: "At Varadaraja Perumal on 22 April 2026, Ramanujar was carried once around the temple, then taken into the shrine to sit before the Perumal, facing south, for the thirumanjanam. The purappadu followed in the evening.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "narasimha-jayanti",
    kind: "festival",
    name: "Narasimha Jayanti",
    tamil: "நரசிம்ம ஜெயந்தி",
    gloss: "the appearance of Narasimha",
    about: [
      {
        q: "What is it?",
        a: "The day Vishnu appeared as Narasimha, the man-lion, to protect the boy Prahlada from his own father, the demon king Hiranyakashipu.",
      },
      {
        q: "The story",
        a: "Hiranyakashipu had won a boon: he could be killed neither by man nor by beast, neither by day nor by night, neither indoors nor out. Narasimha — neither man nor beast — burst from a pillar at dusk and killed him on the threshold of his palace.",
      },
      {
        q: "When does it happen?",
        a: "On the fourteenth day of the waxing moon in the lunar month of Vaishakha, in April or May — the day before the full moon. Worship centres on twilight, the hour of his appearance. At Varadaraja Perumal, on 30 April 2026, it was marked with a thirumanjanam.",
      },
      {
        q: "What to look for",
        a: "Panakam — jaggery water flavoured with dry ginger and cardamom — the offering most associated with Narasimha, said to cool his fierce form.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "andu-vizha",
    kind: "festival",
    name: "Andu Vizha",
    tamil: "ஆண்டு விழா",
    gloss: "the yearly celebration of a temple's consecration",
    about: [
      {
        q: "What is it?",
        a: "Literally “the year's festival”. In a temple it usually marks the anniversary of its consecration, the kumbhabhishekam, and the rite at its heart is often called the varushabhishekam — the anniversary abhishekam.",
      },
      {
        q: "What happens?",
        a: "Typically, pots of water — kalasams — are set up and worshipped with homams, and the water, charged by the rites, is poured over the deity. A full kumbhabhishekam is meant to be performed again only about every twelve years; in between, the anniversary renews it.",
      },
      {
        q: "In Pondicherry",
        a: "At Manakkula Vinayakar we attended the Andu Vizha on 29 March 2026. On the two days after came a laksha japa homam and a sahasra shankhabhishekam.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "varsha-pirappu",
    kind: "festival",
    name: "Varsha Pirappu",
    tamil: "வருடப் பிறப்பு",
    gloss: "the Tamil New Year",
    about: [
      {
        q: "What is it?",
        a: "The first day of the Tamil year — the day the sun enters Mesha, Aries, and the month of Chithirai begins, usually 14 April. It is also called Puthandu.",
      },
      {
        q: "What happens?",
        a: "At home, a kolam at the door and, in many houses, a mango pachadi — raw mango, jaggery and neem flowers, sweet, sour and bitter together, like the year ahead. In many temples the new panchangam, the almanac, is read out: the year's forecast of rain, harvest and fortune.",
      },
      {
        q: "In Pondicherry",
        a: "At the Chetty Kovil the day's procession brought out the Garuda vahana and the Adhikara Nandi. At Varadaraja Perumal it was the day of the Laksha Deepam.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "laksha-deepam",
    kind: "festival",
    name: "Laksha Deepam",
    tamil: "லட்ச தீபம்",
    gloss: "a hundred thousand lamps",
    about: [
      {
        q: "What is it?",
        a: "An evening when a temple is lit with a laksha — a hundred thousand — small lamps, set out along its walls, steps and mandapams, and around its tank if it has one.",
      },
      {
        q: "When does it happen?",
        a: "There is no one day for it: each temple holds it on an occasion of its own choosing. At Varadaraja Perumal it fell on Tamil New Year's day, 14 April 2026.",
      },
      {
        q: "What happens?",
        a: "Small clay lamps are filled with oil or ghee and set out through the day, then lit at dusk — many of them by devotees, for whom lighting a lamp is itself an offering.",
      },
      {
        q: "What to look for",
        a: "Who pays for the lamps, the oil and the wicks, and who spends the day setting them out.",
      },
    ],
    editorial: DRAFT,
  },

  /* ---------------- Rituals ---------------- */
  {
    id: "dhvajarohanam",
    kind: "ritual",
    name: "Dhvajarohanam",
    tamil: "கொடியேற்றம்",
    alsoKnownAs: "Kodiyetram",
    gloss: "the hoisting of the temple flag",
    about: [
      {
        q: "What is it?",
        a: "The raising of a flag on the temple's flagstaff — the dhvajasthambham, or kodimaram — which formally opens a festival.",
      },
      {
        q: "What happens?",
        a: "The flag carries the emblem of the deity's vahana: Nandi at a Shiva temple, Garuda at a Vishnu temple. Once it is raised, the festival has begun; its lowering at the end closes it.",
      },
      {
        q: "What to look for",
        a: "The bali offerings made around the foot of the flagstaff. At the Chetty Kovil, on 23 March 2026, they were balls of rice.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "purappadu",
    kind: "ritual",
    name: "Purappadu",
    tamil: "புறப்பாடு",
    alsoKnownAs: "Veethi ula",
    gloss: "the deity sets out in procession",
    about: [
      {
        q: "What is it?",
        a: "Literally a “setting out”: the deity's festival image is carried out from the sanctum on a vahana or palanquin — around the temple within its walls (ul purappadu), or out through the streets (veethi ula).",
      },
      {
        q: "What happens?",
        a: "The utsava murtis are dressed in their alangaram and receive arati before being carried out, with the nadaswaram leading. A procession through the streets brings the deity to those who have not come to the temple.",
      },
      {
        q: "What to look for",
        a: "The people behind it: the vahana bearers, the cart owners and the musicians, many of them working part time around their day jobs. And the waiting — the time announced is rarely the time the deity comes out.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "thirumanjanam",
    kind: "ritual",
    name: "Thirumanjanam",
    tamil: "திருமஞ்சனம்",
    gloss: "the sacred bath of the deity",
    about: [
      {
        q: "What is it?",
        a: "The Vaishnava name for abhishekam: the ritual bathing of the deity.",
      },
      {
        q: "What happens?",
        a: "Substances are poured over the images one after another — milk, curd, fruits, honey, tender coconut water — with lamps shown after each and water to wash the images clean in between. It ends with water from a consecrated pot, the kalasam.",
      },
      {
        q: "What to look for",
        a: "At Varadaraja Perumal: the ladle and the plate made to turn the kalasam water into a shower as it falls over the deity.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "unjal",
    kind: "ritual",
    name: "Unjal utsavam",
    tamil: "ஊஞ்சல் உற்சவம்",
    gloss: "the deity on the swing",
    about: [
      {
        q: "What is it?",
        a: "The deity, usually with the consorts, is seated on a swing — an unjal — and gently rocked.",
      },
      {
        q: "When does it happen?",
        a: "Usually in the evening, sometimes as one day of a larger festival. In Pondicherry we saw it at the Chetty Kovil during its Brahmotsavam, and at Varadaraja Perumal in April.",
      },
      {
        q: "What to look for",
        a: "The change of mood. At the Chetty Kovil it was noticeably more relaxed than the days of procession around it.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "tirukalyanam",
    kind: "ritual",
    name: "Tirukalyanam",
    tamil: "திருக்கல்யாணம்",
    gloss: "the divine wedding",
    about: [
      {
        q: "What is it?",
        a: "The marriage of the deity to the goddess, celebrated with the rites of a Hindu wedding.",
      },
      {
        q: "When does it happen?",
        a: "Often as one of the days of a temple's Brahmotsavam. At the Chetty Kovil it fell on 27 March 2026.",
      },
      {
        q: "What happens?",
        a: "The festival images of the god and goddess are dressed as groom and bride and seated side by side, and the priests perform the rites of a Tamil wedding: garlands are exchanged, a homam is lit, and the thali — the marriage necklace — is tied as the nadaswaram and drums rise to a crescendo. Devotees come as wedding guests, and the unmarried come to pray for a match.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "teerthavari",
    kind: "ritual",
    name: "Teerthavari",
    tamil: "தீர்த்தவாரி",
    gloss: "the sacred bath in the waters",
    about: [
      {
        q: "What is it?",
        a: "The ritual bath of the deity in a body of water — a temple tank, a river or the sea — usually the closing rite of a festival.",
      },
      {
        q: "What happens?",
        a: "The image is carried in procession to the water and bathed on the bank; then the priests, holding it, dip it into the water — and the crowd goes in with it, since the water is held to be at its holiest at that moment. Often the image dipped is a small stand-in: the astra, Shiva's weapon, at a Shiva temple; the Chakrattalvar, Vishnu's discus, at a Vishnu temple.",
      },
      {
        q: "What to look for",
        a: "Which image goes into the water. At the Chetty Kovil it is the small astra murti — kept by the flagstaff from the festival's first day — that takes the dip in the sea.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "pradosham",
    kind: "ritual",
    name: "Pradosham",
    tamil: "பிரதோஷம்",
    gloss: "twilight worship of Shiva, twice a month",
    about: [
      {
        q: "What is it?",
        a: "Evening worship of Shiva on the thirteenth day of each lunar fortnight — so twice a month — with Nandi at its centre.",
      },
      {
        q: "The story",
        a: "When the ocean was churned for the nectar of immortality, a poison rose that threatened the world. Shiva swallowed it — and at twilight on this day, it is said, he danced between Nandi's horns.",
      },
      {
        q: "What happens?",
        a: "At twilight, roughly 4.30 to 6 in the evening, Nandi and Shiva are bathed with milk, curd, honey and sandal paste. The festival image of Shiva with Parvati is carried around the inner corridor, and many devotees look at Shiva through the space between Nandi's horns.",
      },
      {
        q: "In Pondicherry",
        a: "The project's first evening in a temple, 16 March 2026 at the Chetty Kovil, was a Pradosham.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "shankhabhishekam",
    kind: "ritual",
    name: "Shankhabhishekam",
    tamil: "சங்காபிஷேகம்",
    gloss: "the bath from conches",
    about: [
      {
        q: "What is it?",
        a: "An abhishekam — a ritual bath of the deity — in which the water is poured from conch shells. There are often 108 of them, or 1,008 for a sahasra (“thousand”) shankhabhishekam.",
      },
      {
        q: "When does it happen?",
        a: "Best known on the Mondays of Karthigai (November–December) in Shiva temples. It can also mark the close of a festival, or the anniversary of a temple's consecration.",
      },
      {
        q: "What happens?",
        a: "The conches are filled with consecrated water, set out in rows or a pattern on a bed of rice or paddy, and worshipped with mantras. Then they are taken in, one after another, and poured over the deity.",
      },
      {
        q: "In Pondicherry",
        a: "At Manakkula Vinayakar, a sahasra shankhabhishekam on 31 March 2026, two days after its Andu Vizha. At the Chetty Kovil, a shankhabhishekam closed the Brahmotsavam on 5 April 2026.",
      },
    ],
    editorial: DRAFT,
  },
  {
    id: "homam",
    kind: "ritual",
    name: "Homam",
    tamil: "ஹோமம்",
    gloss: "the fire offering",
    about: [
      {
        q: "What is it?",
        a: "A fire offering. A fire is kindled in a pit or altar, the homa kundam, and offerings are poured into it with mantras — ghee above all, with grains, herbs and twigs of particular sacred trees. The fire, Agni, carries them to the gods.",
      },
      {
        q: "When does it happen?",
        a: "At the start or close of festivals, at consecrations and their anniversaries, and whenever a special worship is vowed. Many are named for their deity or mantra: a Ganapati homam, a Sudarshana homam.",
      },
      {
        q: "What happens?",
        a: "It ends with the purnahuti, the “full offering”: a bundle of cloth filled with offerings, given to the fire with a last stream of ghee. Pots of water, kalasams, worshipped beside the fire are often carried in afterwards to bathe the deity.",
      },
      {
        q: "In Pondicherry",
        a: "At Manakkula Vinayakar, a laksha japa homam on 30 March 2026 — the fire offering that goes with a mantra chanted a hundred thousand times. At Varadaraja Perumal, a homam on 1 May 2026, the last day of the Davana utsavam.",
      },
    ],
    editorial: DRAFT,
  },
];
