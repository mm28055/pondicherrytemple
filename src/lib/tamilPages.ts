/* The pages that have a Tamil version, and the way from one to the other
   (the EN | த switch, components/Nav): the English address, with /ta before
   it ("/pondicherry/vedapuriswara", "/ta/pondicherry/vedapuriswara"): the
   home page, the field notes, the Temples page, every temple's page and its photographs, the Festivals & Rituals
   page, the Calendar and the month pages, the About, Photographs and Films pages, and each film's own. */

const PAGES = /^\/(pondicherry(\/(?!book$)[^/]+(\/photographs)?)?|in-and-around-pondicherry\/[^/]+(\/photographs)?|festivals-and-rituals(\/month\/[^/]+(\/\d+)?)?|calendar|about|photographs|field-notes(\/(?!text$)[^/]+)?|films(\/[^/]+)?)?$/;

/** Whether an address is a Tamil page's. */
export const isTamil = (path: string) => path === "/ta" || path.startsWith("/ta/");
/** The English page's address, of either's. */
export const englishOf = (path: string) => (isTamil(path) ? path.slice(3) || "/" : path);
/** The Tamil page's address, if the page has one. */
export const tamilOf = (path: string): string | undefined => {
  const en = englishOf(path);
  return PAGES.test(en) ? (en === "/" ? "/ta" : `/ta${en}`) : undefined;
};
