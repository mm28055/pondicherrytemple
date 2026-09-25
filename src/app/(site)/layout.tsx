import type { Metadata } from "next";
import { Anek_Devanagari, Anek_Latin, Anek_Tamil, Newsreader } from "next/font/google";
import { draftMode } from "next/headers";
import "@/styles/site.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealManager } from "@/components/RevealManager";

/* The public site. (The admin, under /admin, has its own layout in (payload).) */

// Self-hosted at build time: no request to Google from the visitor's browser.
// Anek Latin and Anek Tamil are one design family, so Tamil and English
// display type match. Both are variable in width; the headings use it narrow.
const anekLatin = Anek_Latin({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-anek-latin",
  display: "swap",
});

const anekTamil = Anek_Tamil({
  subsets: ["tamil", "latin"],
  axes: ["wdth"],
  variable: "--font-anek-tamil",
  display: "swap",
});

// Only the About page uses Devanagari (the name's Sanskrit spelling), so it
// isn't preloaded: the browser fetches it only where it appears.
const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari"],
  axes: ["wdth"],
  variable: "--font-anek-devanagari",
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sthalam — The Temple Documentation Project",
    template: "%s — Sthalam",
  },
  description:
    "The temple is the soul of every town. Sthalam unearths the temple life hidden in plain sight, beginning with Pondicherry. A Centre for Shaiva Studies project.",
  // The tab icon (red and white stripes) comes from app/icon.svg and app/favicon.ico.
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // An editor pressed "Preview" in the admin: the site is showing unpublished drafts.
  const { isEnabled: previewing } = await draftMode();
  return (
    <html lang="en" className={`${anekLatin.variable} ${anekTamil.variable} ${anekDevanagari.variable} ${newsreader.variable}`}>
      <body>
        {previewing && (
          <div className="preview-bar">
            Preview — showing unpublished drafts. <a href="/next/exit-preview">Leave preview</a>
          </div>
        )}
        <Nav />
        {children}
        <Footer />
        <RevealManager />
      </body>
    </html>
  );
}
