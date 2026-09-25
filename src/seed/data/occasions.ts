import type { Occasion } from "./types";

/* Occasions the team was present for, taken from the dated headings of the
   running log — attendance only, no descriptions. Only for the three sample
   temples so far. Published schedules the team did not attend are left out.

   Each is tagged with the festivals and rituals it involved; that is what
   links a temple to its festivals, and a festival to its temples.

   Varadaraja Perumal: the log's April series and its May "PERUMAL" entries
   are taken to be the MG Road temple — to confirm with Arun. */

const P = "pondicherry" as const;

export const occasions: Occasion[] = [
  // Chetty Kovil (Kalahasteeswarar) — the Panguni Brahmotsavam
  { date: "2026-03-16", region: P, temple: "chetty-kovil", label: "Pradosham — the first day of documentation", observances: ["pradosham"] },
  { date: "2026-03-23", region: P, temple: "chetty-kovil", label: "Brahmotsavam begins: the flag is hoisted", observances: ["brahmotsavam", "dhvajarohanam"], note: "2026-03-23-first-day-at-chetty-kovil" },
  { date: "2026-03-27", region: P, temple: "chetty-kovil", label: "Tirukalyanam, the divine wedding", observances: ["brahmotsavam", "tirukalyanam"] },
  { date: "2026-04-01", region: P, temple: "chetty-kovil", label: "Natarajar Teerthavari", observances: ["brahmotsavam", "teerthavari"] },
  { date: "2026-04-03", region: P, temple: "chetty-kovil", label: "Unjal utsavam", observances: ["brahmotsavam", "unjal"] },
  { date: "2026-04-05", region: P, temple: "chetty-kovil", label: "Shankhabhishekam — the Brahmotsavam closes", observances: ["brahmotsavam", "shankhabhishekam"] },
  { date: "2026-04-12", region: P, temple: "chetty-kovil", label: "Bhairava archanai", observances: [] },
  { date: "2026-04-14", region: P, temple: "chetty-kovil", label: "Varsha Pirappu: Garuda vahana with Adhikara Nandi", observances: ["varsha-pirappu", "purappadu"] },

  // Manakkula Vinayakar
  { date: "2026-03-29", region: P, temple: "manakkula-vinayakar", label: "Andu Vizha", observances: ["andu-vizha"] },
  { date: "2026-03-30", region: P, temple: "manakkula-vinayakar", label: "Laksha japa homam", observances: ["homam"] },
  { date: "2026-03-31", region: P, temple: "manakkula-vinayakar", label: "Sahasra shankhabhishekam", observances: ["shankhabhishekam"] },
  { date: "2026-04-06", region: P, temple: "manakkula-vinayakar", label: "Pancha Vinayaka veethi ula", observances: ["purappadu"], note: "2026-04-06-pancha-vinayaka-procession" },

  // Varadaraja Perumal, MG Road
  { date: "2026-04-08", region: P, temple: "varadaraja-perumal", label: "Thirumanjanam", observances: ["thirumanjanam"] },
  { date: "2026-04-09", region: P, temple: "varadaraja-perumal", label: "Theppa utsavam", observances: ["theppa-utsavam"] },
  { date: "2026-04-10", region: P, temple: "varadaraja-perumal", label: "Mutthupallakku tiruveethi purappadu", observances: ["purappadu"] },
  { date: "2026-04-11", region: P, temple: "varadaraja-perumal", label: "Unjal utsavam", observances: ["unjal"] },
  { date: "2026-04-12", region: P, temple: "varadaraja-perumal", label: "Panaka puja", observances: [] },
  { date: "2026-04-14", region: P, temple: "varadaraja-perumal", label: "Laksha Deepam", observances: ["laksha-deepam"] },
  { date: "2026-04-22", region: P, temple: "varadaraja-perumal", label: "Ramanuja utsavam: Thirumanjanam and purappadu", observances: ["ramanuja-utsavam", "thirumanjanam", "purappadu"], note: "2026-04-22-thirumanjanam-varadaraja-perumal" },
  { date: "2026-04-23", region: P, temple: "varadaraja-perumal", label: "Ramar purappadu on Punarpoosam", observances: ["purappadu"] },
  { date: "2026-04-30", region: P, temple: "varadaraja-perumal", label: "Narasimha Jayanti thirumanjanam", observances: ["narasimha-jayanti", "thirumanjanam"] },
  { date: "2026-05-01", region: P, temple: "varadaraja-perumal", label: "Davana utsavam: homam and the closing veethi ula", observances: ["davana-utsavam", "homam", "purappadu"] },
  { date: "2026-05-23", region: P, temple: "varadaraja-perumal", label: "Vaikasi Brahmotsavam begins: the flag is hoisted", observances: ["brahmotsavam", "dhvajarohanam"] },
  { date: "2026-05-27", region: P, temple: "varadaraja-perumal", label: "Nachiyar tirukolam procession", observances: ["brahmotsavam", "purappadu"] },
];
