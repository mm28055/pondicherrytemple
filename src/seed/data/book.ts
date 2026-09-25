import type { Book } from "./types";

/* The Pondicherry book, described from Deepa's working outline
   (Google Doc, August 2026). One line per part, in my words — the outline
   itself stays private. Byline and part summaries need Deepa's approval. */

export const books: Book[] = [
  {
    region: "pondicherry",
    status: "In preparation",
    byline: "Deepa Reddy, with Arunaditya",
    illustrations: "Abishek P.",
    parts: [
      {
        title: "Introduction",
        summary:
          "Story, space, time, rules, movement, excess and presence — the questions a temple poses, and how we went about following them.",
      },
      {
        title: "A Town and its Temples",
        summary:
          "The temples that were here, the temples that arrived, and the processional routes that tie them together, told through old maps and new.",
      },
      {
        title: "The Temple and its People",
        summary:
          "The communities, lineages and roles — hereditary and appointed — that sustain a temple and lay claim to it.",
      },
      {
        title: "The Temples We Followed",
        summary:
          "Fifteen of Pondicherry's temples, each in context, with an illustrated plan and its ritual year: daily, monthly and annual.",
        link: { href: "/pondicherry", label: "The temples so far" },
      },
      {
        title: "The Forms",
        summary:
          "Gopuram, threshold, flagstaff, mandapam, sanctum, tank and kitchen — illustrated, and evoked rather than catalogued.",
      },
      {
        title: "The Elements",
        summary:
          "The recurring vocabularies of worship: alankaram, abhishekam, procession, song, story, the swing, the divine wedding, prasadam.",
        link: { href: "/festivals-and-rituals", label: "Festivals & rituals so far" },
      },
      {
        title: "The Festivals",
        summary:
          "Longer meditations on a chosen few festivals, each a way into history, text and meaning across the ritual year.",
        link: { href: "/festivals-and-rituals", label: "Festivals & rituals so far" },
      },
      {
        title: "An Enchanted Universe",
        summary: "A closing reflection.",
      },
    ],
    editorial: { status: "awaiting-approval" },
  },
];
