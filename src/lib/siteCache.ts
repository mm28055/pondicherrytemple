/* The tag on everything the public site reads from the database, kept
   between visits (lib/data): cleared whenever anything is saved or deleted
   in the admin (payload/revalidate), so the site shows it at once. */
export const SITE_CONTENT_TAG = "site-content";

/* The photographs themselves (thousands of them, read in parts): kept under
   a tag of their own, cleared only when a photo or a photo set is saved or
   deleted, so that saving a field note or a temple does not have every
   photograph read from the database again. */
export const PHOTOS_TAG = "site-photos";
