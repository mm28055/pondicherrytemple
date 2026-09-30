import type { Temple } from "./types";

/* The fifteen temples, in the order of Deepa's brief to the illustrator
   (2 August 2026). Streets are as given there.

   Only temples with an `intro` get a page. The three intros below are
   DRAFTS written from facts recorded in the running log — placeholders
   for Deepa's own text, not the project's final voice. */

export const temples: Temple[] = [
  {
    id: "manakkula-vinayakar",
    region: "pondicherry",
    name: "Manakkula Vinayakar Devasthanam",
    deity: "Vinayaka",
    group: "vinayaka",
    street: "White Town, near the sea front",
    intro: [
      "Pondicherry's best-known temple, the shrine of Manakkula Vinayakar stands in the old town a short walk from the sea.",
      "We first came for its Andu Vizha — the yearly celebration of its kumbhabhishekam — on 29 March 2026, and followed the days of chanting, abhishekam and procession that ran on into April.",
    ],
  },
  {
    id: "vedapuriswara",
    region: "pondicherry",
    name: "Vedapuriswara Koil",
    deity: "Shiva as Vedapuriswara, with Tripurasundari",
    group: "shiva",
    street: "MG Road",
  },
  {
    id: "varadaraja-perumal",
    region: "pondicherry",
    name: "Varadaraja Perumal Koil",
    deity: "Vishnu as Varadaraja Perumal",
    group: "vishnu",
    street: "MG Road",
    intro: [
      "The Varadaraja Perumal temple on MG Road keeps the Vaikhanasa tradition of worship, in which only the temple's Bhattars may perform the main puja.",
      "We began following it in early April 2026, through the Theppa utsavam and the Ramanuja utsavam, Narasimha Jayanti and the Davana utsavam at Chitra Pournami, and on into its Vaikasi Brahmotsavam.",
    ],
  },
  {
    id: "chetty-koil",
    region: "pondicherry",
    name: "Kalahasteeswarar Koil",
    knownAs: "Chetty Koil",
    deity: "Shiva as Kalahasteeswarar, with a Varadaraja Perumal shrine",
    group: "shiva",
    street: "Mission Street",
    intro: [
      "The Kalahasteeswarar temple on Mission Street, known in town as the Chetty Koil, is where this project began: introductions by T. Ganesan on the morning of 16 March 2026, a Pradosham day, and the evening puja that followed.",
      "A week later its Panguni Brahmotsavam began, and we followed it from the flag hoisting on 23 March to the Shankhabhishekam that closed it on 5 April.",
    ],
  },
  {
    id: "kamakshi-amman",
    region: "pondicherry",
    name: "Kamakshi Amman Koil",
    deity: "Kamakshi",
    group: "amman",
  },
  {
    id: "sundara-vinayakar",
    region: "pondicherry",
    name: "Sundara Vinayaka Koil",
    deity: "Vinayaka",
    group: "vinayaka",
    street: "Near the Ellaiamman Koil",
  },
  {
    id: "angala-parameswari",
    region: "pondicherry",
    name: "Angala Parameswari Koil",
    deity: "Angala Parameswari",
    group: "amman",
    street: "Angala Nagar, Muthialpet",
  },
  {
    id: "siva-subramania-lawspet",
    region: "pondicherry",
    name: "Sri Siva Subramania Swamy Devasthanam",
    deity: "Murugan as Subramania",
    group: "murugan",
    street: "Lawspet",
  },
  {
    id: "kanniga-parameswari",
    region: "pondicherry",
    name: "Sri Vasavi Kanniga Parameswari Devasthanam",
    deity: "Vasavi Kanniga Parameswari",
    group: "amman",
    street: "MG Road",
  },
  {
    id: "nandikeswara",
    region: "pondicherry",
    name: "Nandikeswara Koil",
    deity: "Nandikeswara, with the Gangai Vinayaka shrine",
    group: "shiva",
  },
  {
    id: "mutthumariamman",
    region: "pondicherry",
    name: "Mutthumariamman Koil",
    deity: "Mariamman",
    group: "amman",
    street: "Mutthumariamman Street",
  },
  {
    id: "ghousika-balasubramaniar",
    region: "pondicherry",
    name: "Ghousika Balasubramaniar Koil",
    deity: "Murugan as Balasubramaniar",
    group: "murugan",
    street: "Near the railway station",
  },
  {
    id: "manimutthumariamman",
    region: "pondicherry",
    name: "Manimutthumariamman Koil",
    deity: "Mariamman",
    group: "amman",
    street: "Chinna Subbaraya Salai, near Kamban Kalairangam",
  },
  {
    id: "manonmani-mariamman",
    region: "pondicherry",
    name: "Manonmani Mariamman Koil",
    deity: "Mariamman",
    group: "amman",
    street: "Canteen Street",
  },
  {
    id: "draupadi-amman",
    region: "pondicherry",
    name: "Draupadi Amman Koil",
    deity: "Draupadi Amman",
    group: "amman",
    street: "Iswaran Dharmaraja Koil Street",
  },
];
