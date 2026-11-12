import Script from "next/script";

/* Google Analytics (property "Sthalam", account "Centre for Shaiva Studies",
   under namaste@shaivastudies.in). Only on the live site — not on Vercel's
   previews nor on a laptop — and only on the public pages: the admin has its
   own layout, so the team's editing is not counted.

   No cookie banner. Visitors in the European Economic Area, the UK and
   Switzerland, where analytics cookies need consent first, are measured
   without cookies (Google's consent mode: counted, not remembered); everyone
   else in full. Nothing is ever used for advertising. Page changes inside
   the site are counted by GA's enhanced measurement (browser history). */

const MEASUREMENT_ID = "G-8XPZ9BX2V1";

// EEA (EU + Iceland, Liechtenstein, Norway), the UK and Switzerland
const CONSENT_FIRST = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

export function Analytics() {
  if (process.env.VERCEL_ENV !== "production") return null;
  return (
    <>
      {/* the consent defaults must be set before Google's script loads */}
      <Script id="ga-consent" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_FIRST)}
});
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'granted'
});
gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}', { allow_google_signals: false });`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" />
    </>
  );
}
