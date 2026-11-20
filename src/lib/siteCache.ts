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
   until a photo is added or deleted or a photo set saved here
   (photosChanged), or for two minutes at most (another server, on the live
   site, may have had the save). A photo's details saved (photoSaved) are
   put into the copy kept, so the next page need not read them all again.
   Kept on globalThis: the admin's saving and the pages may be built as
   separate parts of the server, each with its own copy of this module. */
export const PREVIEW_PHOTOS_FOR = 2 * 60 * 1000;
type Shared = { version: number; saved: Map<number, Record<string, unknown>> };
const shared: Shared = ((globalThis as { __sthalamPhotos?: Shared }).__sthalamPhotos ??= { version: 0, saved: new Map() });
export const photosChanged = () => {
  shared.version++;
  shared.saved.clear();
};
export const photoSaved = (doc: Record<string, unknown> & { id: number }) => void shared.saved.set(doc.id, doc);
export const photosVersionNow = () => shared.version;
/** photos saved since the copy was read, by number: their new details */
export const photosSaved = () => shared.saved;
