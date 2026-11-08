import type { Metadata } from "next";

/* What a page tells WhatsApp, iMessage, Facebook, LinkedIn and X when its
   link is shared (Open Graph): its title, a line about it, and a picture.
   Pages with no picture of their own share the site's card, the film's
   ஸ்தலம் cut from a gopuram (public/share/sthalam.jpg, 1200 × 630). */

export const SITE_URL = "https://sthalam.org";

type Image = { url: string; width?: number; height?: number; alt?: string };

export const SHARE_CARD: Image = {
  url: "/share/sthalam.jpg",
  width: 1200,
  height: 630,
  alt: "ஸ்தலம் · Sthalam, the temple documentation project",
};

/** A picture of the site's own, at its 960 px copy (small enough for WhatsApp, under 300 KB). */
export const sharePicture = (p?: { medium?: string; src?: string; width?: number; height?: number; alt?: string }): Image | undefined =>
  p && (p.medium || p.src)
    ? {
        url: (p.medium || p.src)!,
        ...(p.medium && p.width && p.height ? { width: 960, height: Math.round((960 * p.height) / p.width) } : {}),
        alt: p.alt || undefined,
      }
    : undefined;

/** A page's title and line, for the tab and for sharing, with its picture or the site's card. */
export function shareMeta({ title, description, image }: { title?: string; description?: string; image?: Image }): Metadata {
  const images = [image ?? SHARE_CARD];
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    openGraph: {
      type: "website",
      siteName: "Sthalam",
      locale: "en_IN",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: images.map((i) => i.url),
    },
  };
}
