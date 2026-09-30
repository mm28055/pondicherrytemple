import type { Illustration } from "./types";

/* SEED DATA ONLY — drawings are now added in the admin (Write & upload →
   Drawings). This file is what `npm run seed` put into an empty database.

   The three entries are PLACEHOLDERS: one generic dummy plan (uploaded from
   src/seed/files/placeholder-plan.svg), shown on each temple page so the
   layout can be judged. In the admin, replace each with Abishek's drawing of
   that temple; any placeholder still there must go before launch. (`src`
   below is ignored — the seed uploads the file.) */

const PLACEHOLDER: Omit<Illustration, "id" | "title" | "temples"> = {
  region: "pondicherry",
  kind: "plan",
  caption: "placeholder for the temple's illustrated plan",
  credit: "To be drawn by Abishek P.",
  src: "/drawings/placeholder-plan.svg",
  width: 1200,
  height: 1500,
  alt: "Placeholder: a generic temple plan, standing in for Abishek P.'s drawing",
  observances: [],
  editorial: { status: "awaiting-approval" },
};

export const illustrations: Illustration[] = [
  { ...PLACEHOLDER, id: "manakkula-vinayakar-plan", title: "Manakkula Vinayakar Devasthanam", temples: ["manakkula-vinayakar"] },
  { ...PLACEHOLDER, id: "varadaraja-perumal-plan", title: "Varadaraja Perumal Koil", temples: ["varadaraja-perumal"] },
  { ...PLACEHOLDER, id: "chetty-koil-plan", title: "Chetty Koil", temples: ["chetty-koil"] },
];
