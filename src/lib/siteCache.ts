/* The tag on everything the public site reads from the database, kept
   between visits (lib/data): cleared whenever anything is saved or deleted
   in the admin (payload/revalidate), so the site shows it at once. */
export const SITE_CONTENT_TAG = "site-content";

/* The photographs themselves (thousands of them, read in parts): kept under
   a tag of their own, cleared only when a photo or a photo set is saved or
   deleted, so that saving a field note or a temple does not have every
   photograph read from the database again. */
export const PHOTOS_TAG = "site-photos";

/* While previewing (and in Admin2) Next keeps nothing between visits, and
   reading every photograph afresh made a temple's page take 6 seconds
   (20 Nov 2026). So there they are kept in this server's memory instead,
   until a photo or photo set is saved here (photosChanged) or for two
   minutes at most (another server, on the live site, may have had the save). */
export const PREVIEW_PHOTOS_FOR = 2 * 60 * 1000;
let photosVersion = 0;
export const photosChanged = () => void photosVersion++;
export const photosVersionNow = () => photosVersion;
