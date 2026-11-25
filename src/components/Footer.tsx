"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isTamil } from "@/lib/tamilPages";
import { FOOTER_TA, NAV_TA } from "@/content/homeTa";

export function Footer() {
  // in Tamil under a page in Tamil (/ta)
  const ta = isTamil(usePathname());
  const T = ta ? FOOTER_TA : null;
  const label = (href: string, en: string) => (ta ? (NAV_TA[href] ?? en) : en);
  return (
    <footer className={ta ? "site-footer in-ta" : "site-footer"} lang={ta ? "ta" : undefined}>
      <div className="stripes tall" aria-hidden="true" />
      <div className="wrap">
        <div className="footer-inner">
          <div>
            <span className="brand-word">Sthalam</span>
            <span className="brand-tamil" lang="ta">
              ஸ்தலம்
            </span>
            <p>
              {T?.about ??
                "The temple is the soul of every town. Sthalam unearths the temple life hidden in plain sight, beginning with Pondicherry. A project of the Centre for Shaiva Studies."}
            </p>
          </div>
          <div>
            <h4>{T?.explore ?? "Explore"}</h4>
            <ul>
              <li><Link href={ta ? "/ta/pondicherry" : "/pondicherry"}>{label("/pondicherry", "Temples")}</Link></li>
              <li><Link href={ta ? "/ta/festivals-and-rituals" : "/festivals-and-rituals"}>{label("/festivals-and-rituals", "Festivals & Rituals")}</Link></li>
              <li><Link href={ta ? "/ta/calendar" : "/calendar"}>{label("/calendar", "Calendar")}</Link></li>
              <li><Link href="/field-notes">{label("/field-notes", "Writings")}</Link></li>
              <li><Link href={ta ? "/ta/photographs" : "/photographs"}>{label("/photographs", "Photographs")}</Link></li>
              <li><Link href={ta ? "/ta/films" : "/films"}>{label("/films", "Films")}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{T?.project ?? "The project"}</h4>
            <ul>
              <li><Link href="/pondicherry/book">{T?.book ?? "The Book"}</Link></li>
              <li><Link href={ta ? "/ta/about" : "/about"}>{label("/about", "About")}</Link></li>
              <li><Link href={ta ? "/ta/about#team" : "/about#team"}>{T?.team ?? "The team"}</Link></li>
              <li><Link href={ta ? "/ta/about#contact" : "/about#contact"}>{T?.contact ?? "Contact"}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Sthalam · sthalam.org</span>
          <span>{T?.centre ?? "Centre for Shaiva Studies, Pondicherry"}</span>
        </div>
      </div>
    </footer>
  );
}
