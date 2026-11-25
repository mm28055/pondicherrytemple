/* A temple's page in Tamil (/ta/pondicherry/…): its words. Translated by the
   user's guidelines (English to Tamil, 25 November 2026), for the user's
   review. Which temples have one: lib/tamilPages. */

/** What every temple's page says. */
export const TEMPLE_TA = {
  templesOfTown: "புதுச்சேரியின் கோயில்கள்",
  festivalFilter: "திருவிழா/வழிபாடு",
  yearFilter: "ஆண்டு",
  onThisPage: "இப்பக்கத்தில்",
  cycles: "வழிபாட்டுச் சுழற்சிகள்",
  notes: "களக்குறிப்புகள்",
  films: "காணொளிகள்",
  photographs: "புகைப்படங்கள்",
  articles: "கட்டுரைகள்",
  beingWritten: "இக்கோயிலுக்கான அறிமுகம் எழுதப்பட்டு வருகிறது.",
  stories: "இக்கோயிலின் வரலாற்றையும் கதைகளையும் அறிய",
  allNotes: (n: number) => `எல்லா ${n} களக்குறிப்புகளும்`,
  fewerNotes: "குறைவான களக்குறிப்புகள்",
  allPhotos: (n: string) => `எல்லாப் புகைப்படங்களும் (${n})`,
  dayNotKnown: "நாள் தெரியவில்லை",
  layoutTitle: "கோயிலின் தளவரைபடம் (வரையப்படும் வரை ஒரு மாதிரிப் படம்)",
  layoutSee: "முழு வரைபடத்தைக் காண்க",
  layoutSoon: ["வரைபடம்", "விரைவில்"] as [string, string],
};

/** The Temples page. */
export const TEMPLES_PAGE_TA = {
  name: "புதுச்சேரியின் கோயில்கள்",
  place: "புதுச்சேரி",
  title: "கோயில்கள்",
  intro: [
    "புதுச்சேரியில் 250 அல்லது அதற்கு மேற்பட்ட கோயில்கள் உள்ளன. 2026 ஆம் ஆண்டு மார்ச் மாதம் முதல் அவற்றுள் பதினைந்து கோயில்களை ஒரு முழு வழிபாட்டு ஆண்டு முழுவதும் தொடர்ந்து கவனித்து வருகிறோம்: சிறியவையும் பெரியவையும், பழமையானவையும் அண்மையில் எழுந்தவையும், பெருங்கோயில்களும், நகரின் கடைகளுக்கு நடுவே அமைந்த தெருக்கோயில்களும். இங்கே நீங்கள் காண்பவை தற்காலிகமானவை: எங்கள் நடப்புப் பணியாகிய, தொடர்ந்து எழுதி வரும் களக்குறிப்புகள், கோயில் வரலாறுகளையும் உற்சவங்களையும் பற்றிய, இன்னும் நடந்துகொண்டிருக்கும், இன்னும் எழுதப்பட்டுச் செம்மையாகிவரும் ஆய்வு. நாங்கள் வழங்கும் எழுத்துகள் எவ்வகையிலும் முடிவுற்றவையோ முழுமையானவையோ அல்ல.",
    "ஆண்டு செல்லச் செல்ல ஒவ்வொரு கோயிலின் பக்கமும் வளர்கிறது: நாங்கள் உடனிருந்த திருவிழாக்களும் வழிபாடுகளும், அங்கே எழுதிய களக்குறிப்புகளும், காலப்போக்கில் கோயிலின் சித்திரத் தளவரைபடமும். இன்னும் தன்னைத் திரட்டிக்கொண்டு, விரிந்து, தன் முடிவைத் தானே கண்டடையும் ஒரு கதையைப் போல எங்கள் பணியைத் தொடர்ந்து வாருங்கள்.",
  ],
  latest: "இக்கோயிலிலிருந்து அண்மையவை",
  also: "பதிவாகி வரும் பிற கோயில்கள்",
  alsoNote: "முதல் குறிப்புகள் தயாரானதும் இவை ஒவ்வொன்றுக்கும் தனிப் பக்கம் அமையும்.",
  around: "புதுச்சேரியும் சுற்றுவட்டாரமும்",
  aroundNote: "புதுச்சேரியிலும் சுற்றுவட்டாரத்திலும் சென்று கண்ட பிற கோயில்கள்",
  photosOf: (n: string, temple: string) => `${temple}: எல்லாப் புகைப்படங்களும் (${n})`,
};
/** The sets under the town's ethos, by their English titles. */
const ETHOS: Record<string, string> = {
  "Deepavali Scenes": "தீபாவளிக் காட்சிகள்",
  "Bangabharati Durga Pandal, Navaratri Saptami": "பங்கபாரதி துர்க்கை பந்தல், நவராத்திரி சப்தமி",
  "Panchasana Peetham, Muthialpet Sudugadu": "பஞ்சாசன பீடம், முத்தியால்பேட்டை சுடுகாடு",
  "Shankara Narayanan and Family, Golu Mandapam": "சங்கர நாராயணனும் குடும்பத்தினரும், கொலு மண்டபம்",
  "Parade and Pandal Vinayaka Visarjanam": "ஊர்வல, பந்தல் விநாயகர் விசர்ஜனம்",
  "Vinayaka Pandals": "விநாயகர் பந்தல்கள்",
  "Vinayaka Chaturthi Private Visarjanams, Vaithikuppam": "விநாயக சதுர்த்தி தனியார் விசர்ஜனங்கள், வைத்திக்குப்பம்",
  "Adi Amavasya Kadal Theerthavari": "ஆடி அமாவாசை கடல் தீர்த்தவாரி",
  "Navashakti Karumari Amman Brahmotsavam Friday Sedal": "நவசக்தி கருமாரி அம்மன் பிரம்மோற்சவம், வெள்ளிக்கிழமைச் செடல்",
  "Searching for Damana at Goubert Market": "கூபேர் அங்காடியில் தமனத்தைத் தேடி",
  "Goubert Market Sculptures from Senji Temple": "செஞ்சிக் கோயிலிலிருந்து வந்த கூபேர் அங்காடிச் சிற்பங்கள்",
};
export const ethosTa = (english: string) => ETHOS[english.trim()] ?? english;

export { TEMPLE_INTROS_TA } from "./templeIntrosTa";
export { said } from "./saidTa";

/** The Ritual Cycles: the words of the page. */
export const YEAR_TA = {
  everyWeek: "வாரந்தோறும்",
  twiceAMonth: "மாதம் இருமுறை",
  everyMonth: "மாதந்தோறும்",
  none: "இன்னும் எதுவும் பதிவாகவில்லை.",
  now: "இப்போது",
  tbc: "இன்னும் உறுதியாகவில்லை",
  tbcShort: "உறுதியாக வேண்டும்",
  festivals: (n: number) => `${n} ${n === 1 ? "திருவிழா" : "திருவிழாக்கள்"}`,
  rituals: (n: number) => `${n} ${n === 1 ? "வழிபாடு" : "வழிபாடுகள்"}`,
  kaalams: (n: number) => `${n} ${n === 1 ? "காலம்" : "காலங்கள்"}`,
  days: (n: number) => `${n} ${n === 1 ? "நாள்" : "நாட்கள்"}`,
  happens: "நடப்பது",
  naivedyam: "நைவேத்தியம்",
};
