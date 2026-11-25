import { MONTHS_TA } from "@/content/homeTa";

/** "22 நவம்பர் 2026" */
export const dateTa = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS_TA[m - 1]} ${y}`;
};
/** "2026-11": "நவம்பர் 2026" */
export const monthTa = (id: string) => {
  const [y, m] = id.split("-").map(Number);
  return `${MONTHS_TA[m - 1]} ${y}`;
};
