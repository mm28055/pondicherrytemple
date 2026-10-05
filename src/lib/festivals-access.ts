import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { FESTIVALS_PUBLISHED, TEMPLE_STORIES_PUBLISHED } from "./festivals";

/** Whether this visitor sees pages held in reserve: everyone once they are
    published; until then, someone signed in to the admin (and always on this
    computer, while the site is being worked on). `asPublic` (?as=public)
    shows the public version to them too, to check it. */
export async function seesReserved(published: boolean, asPublic = false): Promise<boolean> {
  if (published) return true;
  if (asPublic) return false;
  if (process.env.NODE_ENV === "development") return true;
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await headers() });
    return Boolean(user);
  } catch {
    return false;
  }
}

/** The festivals and rituals pages (see lib/festivals). */
export const seesFestivalPages = (asPublic = false) => seesReserved(FESTIVALS_PUBLISHED, asPublic);

/** A temple's "Temple & its Stories" page (see lib/festivals). */
export const seesTempleStories = () => seesReserved(TEMPLE_STORIES_PUBLISHED);
