import type { MetadataRoute } from "next";

/** For search engines: the site, but not the admin or its API (each visit
    there would only read the database, to no purpose). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
  };
}
