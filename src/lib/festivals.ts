/* The festivals and rituals pages, held in reserve.

   Until they are ready, the public sees only /festivals-and-rituals as a
   cloud of the festivals' and rituals' names, followed by their field notes.
   The full pages (the photographs page, and each festival's own page) are
   kept, and shown to someone signed in to the admin, so work on them can go
   on; everyone else is never sent to them.

   To publish them all, set this to true. */
export const FESTIVALS_PUBLISHED = false;

/** A festival's or ritual's own page. Whether its name is a link to it is
    decided where the name is shown (components/FestivalLink): for everyone
    once published; until then, for someone signed in to the admin only. */
export function festivalPath(id: string): string {
  return `/festivals-and-rituals/${id}`;
}

/** Whether an address is a festival's or ritual's own page (not a month's). */
export function isFestivalPath(href: string): boolean {
  return /^\/festivals-and-rituals\/(?!month\/)[^/]+/.test(href);
}

/* A temple's "Temple & its Stories" page, held in reserve the same way: the
   public sees the line that leads to it as plain words, "(coming soon)";
   someone signed in to the admin sees the link, and the page.

   To publish them, set this to true. */
export const TEMPLE_STORIES_PUBLISHED = false;
