/* The home page in Tamil (/ta): its words, in one place. Translated by the
   user's guidelines (English to Tamil, 25 November 2026); the opening is the
   user's own approved text, word for word. Anything from the admin that has
   no Tamil here yet (a new field note's title) is shown in English until it
   is added. */

export const HOME_TA = {
  title: "ஸ்தலம் · Sthalam",
  // 25 November 2026, approved
  headline: "நடுவே ஒரு விளக்கு",
  opening: [
    "ஒவ்வோர் ஊருக்கும் அதற்கெனக் கோயில்கள் உண்டு: தெருக்கோடியில் ஒன்று, குளத்தங்கரையில் ஒன்று, நாற்சந்தியில் ஒன்று. ஒவ்வொரு கோயிலிலும் இருள் சூழ்ந்த ஒரு சிறிய கருவறை. அங்கே ஒரு விளக்கின் ஒளியில் தெய்வம் குடிகொண்டிருக்கிறது.",
    "இச்சன்னிதிகளைச் சுற்றித்தான் ஊரின் வாழ்க்கை நடக்கிறது. தெரு விழிப்பதற்கு முன்பே கோயில் விழித்துவிடுகிறது. மணியோசையால் நேரத்தைச் சொல்கிறது; நாள், திதி, திருவிழாக்களைக் கணித்துக் காத்து வருகிறது. உணவளிக்கிறது, ஊராரை ஒன்று சேர்க்கிறது. ஊரின் நேர்த்திக்கடன்கள், செல்வங்கள், நினைவுகள் என எல்லாவற்றையும் தன்னுள் வைத்திருக்கிறது. ஒரு குடும்பத்தால் தனியாகச் சுமக்க முடியாததையும் தாங்கி நிற்கிறது. தலைமுறை தலைமுறையாக மக்கள் இந்த விளக்குகளைக் காத்து வருகிறார்கள்; இந்த விளக்குகளும் அவர்களைக் காத்து வருகின்றன. இவை எரியும் வரை, தான் யார் என்பதை ஊர் மறப்பதில்லை.",
    "எல்லோருடைய கண்முன்னே நடந்தாலும், அரிதாகவே எழுதப்பட்டுள்ள இவ்வாழ்வைப் பதிவு செய்வதே ‘ஸ்தலம்’ முயற்சியின் நோக்கமாகும். இப்பணி புதுச்சேரியிலிருந்து தொடங்குகிறது. சைவ ஆய்வு மையத்தின் (Centre for Shaiva Studies) ஆதரவில், தீபா ரெட்டி தலைமையிலான சிறு குழு ஒன்று, 2026 ஆம் ஆண்டு மார்ச் மாதம் முதல் நகரின் சிறியதும் பெரியதுமான சுமார் இருபது கோயில்களை ஒரு வழிபாட்டு ஆண்டு முழுவதும் தொடர்ந்து கவனித்து வருகிறது. இக்கோயில்களின் நித்திய பூசைகள், திருவிழாக்கள், இவற்றில் தொண்டு புரிந்து இவற்றைப் பேணி வரும் மக்கள், இக்கோயில்கள் காத்து வரும் கதைகள் ஆகியவை இப்பணியில் இடம்பெறுகின்றன.",
  ],
  quote: [
    "கோயில்களின் நாட்காட்டிகள், வழிபாடுகள், கதைகள் எவை? அவற்றைப் பேணி வருவது எது, எந்த உலகை அவை இன்னும் ஒன்றிணைத்து வைத்திருக்கின்றன? ஓர் ஊர் தன் நம்பிக்கைகளையும், தன் சமூகங்களின் வரலாறுகளையும், தன் பாடல்களையும் கலைகளையும் வைத்திருக்கும் இடமாகிய கோயிலை ‘ஸ்தலம்’ பதிவு செய்கிறது, கொண்டாடுகிறது.",
  ],
  quoteLink: "‘ஸ்தலம்’ பற்றிப் படிக்க",
  bookHeading: "நூல் ஒன்று தயாராகி வருகிறது",
  bookText: "இவ்வாண்டின் களப்பணியிலிருந்து, ஒவ்வொரு கோயிலின் சித்திரத் தளவரைபடங்களுடன் எழுதப்படுகிறது.",
  bookLink: "இதில் இடம்பெறக்கூடியவை",

  place: "புதுச்சேரி",
  watch: "காணொளியைக் காண்க",
  watchShort: "காணொளி", // on a phone
  close: "மூடுக",
  latest: "அண்மையில் சேர்த்தவை",
  allNotes: "எல்லாக் களக்குறிப்புகளும்",
  temples: "கோயில்கள்",
  allTemples: "எல்லாக் கோயில்களும்",
  festivals: "திருவிழாக்கள், வழிபாடுகள்",
  allFestivals: "எல்லாத் திருவிழாக்களும் வழிபாடுகளும்",
  soon: "விரைவில்",
  allPhotos: "எல்லாப் படங்களும்",
  counts: (occasions: number, notes: number) =>
    `${occasions} ${occasions === 1 ? "நிகழ்வு" : "நிகழ்வுகள்"} · ${notes} ${notes === 1 ? "களக்குறிப்பு" : "களக்குறிப்புகள்"}`,

  today: "இன்று",
  todayIs: "தமிழ் நாட்காட்டியில் இன்று",
  todaySee: "இன்று பதிவானதைக் காண்க",
  year: (name: string) => `${name} ஆண்டு`,
  fullCalendar: "முழு நாட்காட்டி",
  thisMonth: "இம்மாத நாட்காட்டி",
};

export const WEEKDAYS_TA = ["ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"];
export const MONTHS_TA = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"];

/** The menu's labels, by their address. */
/** Said beside the language switch on every Tamil page. */
export const AI_TA = "AI மொழிபெயர்ப்பு";

export const NAV_TA: Record<string, string> = {
  "/pondicherry": "கோயில்கள்",
  "/festivals-and-rituals": "திருவிழாக்கள், வழிபாடுகள்",
  "/calendar": "நாட்காட்டி",
  "/field-notes": "எழுத்துகள்",
  "/photographs": "புகைப்படங்கள்",
  "/films": "காணொளிகள்",
  "/about": "இப்பணி பற்றி",
};

export const FOOTER_TA = {
  about:
    "கோயிலே ஒவ்வோர் ஊரின் ஆன்மா. புதுச்சேரியில் தொடங்கி, கண்முன்னே மறைந்திருக்கும் கோயில் வாழ்வை ‘ஸ்தலம்’ அகழ்ந்தெடுக்கிறது. இது சைவ ஆய்வு மையத்தின் பணியாகும்.",
  explore: "காண்க",
  project: "இப்பணி",
  book: "நூல்",
  team: "குழு",
  contact: "தொடர்புக்கு",
  centre: "சைவ ஆய்வு மையம், புதுச்சேரி",
};

/** Each temple: its name, its formal one where it differs, the shortest one (on a phone), its street. */
const TEMPLES: Record<string, { name: string; formal?: string; short?: string; street?: string }> = {
  "manakkula-vinayakar": { name: "மணக்குள விநாயகர் கோயில்", formal: "அருள்மிகு மணக்குள விநாயகர் தேவஸ்தானம்", street: "வெள்ளை நகரம், கடற்கரை அருகே" },
  vedapuriswara: { name: "வேதபுரீஸ்வரர் கோயில்", street: "மகாத்மா காந்தி சாலை" },
  "varadaraja-perumal": { name: "வரதராஜப் பெருமாள் கோயில்", street: "மகாத்மா காந்தி சாலை" },
  "chetty-koil": { name: "செட்டிக் கோயில்", formal: "காளத்தீஸ்வரர் கோயில்", short: "செட்டிக் கோயில்", street: "மிஷன் வீதி" },
  "kamakshi-amman": { name: "காமாட்சி அம்மன் கோயில்", formal: "காமாட்சி அம்மன் ஆலயம்" },
  "sundara-vinayakar": { name: "சுந்தர விநாயகர் கோயில்", street: "எல்லையம்மன் கோயில் அருகே" },
  "angala-parameswari": { name: "அங்காளம்மன் கோயில்", formal: "அங்காள பரமேஸ்வரி கோயில்", short: "அங்காளம்மன், முத்தியால்பேட்டை", street: "அங்காள நகர், முத்தியால்பேட்டை" },
  "siva-subramania-lawspet": { name: "லாஸ்பேட்டை முருகன் கோயில்", formal: "சிவ சுப்பிரமணிய சுவாமி தேவஸ்தானம்", street: "லாஸ்பேட்டை" },
  "kanniga-parameswari": { name: "கன்னிகா பரமேஸ்வரி கோயில்", formal: "ஸ்ரீ வாசவி கன்னிகா பரமேஸ்வரி தேவஸ்தானம்", street: "மகாத்மா காந்தி சாலை" },
  nandhikeswara: { name: "நந்திகேஸ்வரர் கோயில்" },
  mutthumariamman: { name: "முத்துமாரியம்மன் கோயில்", street: "முத்துமாரியம்மன் வீதி" },
  "ghousika-balasubramaniar": { name: "கௌசிக பாலசுப்பிரமணியர் கோயில்", short: "கௌசிகபால முருகன்", street: "ரயில் நிலையம் அருகே" },
  manimutthumariamman: { name: "மணிமுத்துமாரியம்மன் கோயில்", street: "சின்ன சுப்பராயச் சாலை, கம்பன் கலையரங்கம் அருகே" },
  "manonmani-mariamman": { name: "மனோன்மணி மாரியம்மன் கோயில்", street: "கேன்டீன் வீதி" },
  "draupadi-amman": { name: "திரௌபதி அம்மன் கோயில்", street: "ஈஸ்வரன் தர்மராஜா கோயில் வீதி" },
  "veerabhadraswamy-choudambika-amman-koil": { name: "வீரபத்திரசுவாமி சௌடாம்பிகை அம்மன் கோயில்", street: "காமன் கோயில் வீதி, லாஸ்பேட்டை" },
  "devanathaswamy-thirukoil": { name: "திருவஹீந்திரபுரம் தேவநாத சுவாமி கோயில்", short: "திருவஹீந்திரபுரம்", street: "திருவஹீந்திரபுரம்" },
  "ezhai-mariamman": { name: "ஏழை மாரியம்மன் கோயில்" },
  ellaiamman: { name: "எல்லையம்மன் கோயில்" },
  "siddhi-vinayaka": { name: "சித்தி விநாயகர் கோயில்" },
  "srinivasa-perumal": { name: "ஸ்ரீநிவாசப் பெருமாள் கோயில்" },
  "heritage-town-angala-parameswari": { name: "பாரம்பரிய நகர் அங்காள பரமேஸ்வரி தேவஸ்தானம்", short: "பாரம்பரிய நகர் அங்காள பரமேஸ்வரி" },
  "sudugadu-angalamman": { name: "சுடுகாட்டு அங்காளம்மன் கோயில்" },
  "senkazhuneer-amman": { name: "செங்கழுநீர் அம்மன் ஆலயம்", short: "செங்கழுநீர் அம்மன்" },
  "varasiddhi-veeravinayaka": { name: "வரசித்தி வீரவிநாயகர் திருக்கோயில்", short: "வரசித்தி வீரவிநாயகர்" },
  "govindasalai-mariamman": { name: "கோவிந்தசாலை மாரியம்மன் கோயில்" },
  "putthumariamman-kuruchikuppam": { name: "புத்துமாரியம்மன் ஆலயம்", short: "புத்துமாரியம்மன்", street: "குருசுக்குப்பம்" },
  "gangai-muttumariamman": { name: "கங்கை முத்துமாரியம்மன் கோயில்", street: "காமாட்சி அம்மன் கோயில் வீதி" },
  "kasukadai-vinayaka": { name: "காசுக்கடை விநாயகர் கோயில்" },
  periyapalayathamman: { name: "பெரியபாளையத்தம்மன் திருக்கோயில்", short: "பெரியபாளையத்தம்மன்" },
  "naga-mutthu-amman": { name: "நாக முத்து அம்மன் கோயில்", street: "காமாட்சி அம்மன் கோயில் வீதி" },
  "thandu-mutthumariamman": { name: "தண்டு முத்துமாரியம்மன் கோயில்", street: "சின்ன சுப்புராயச் செட்டி வீதி" },
  "palani-andavar-muthialpet": { name: "பழனி ஆண்டவர் கோயில்", street: "26, பாரதிதாசன் வீதி, முத்தியால்பேட்டை" },
  "mutthalamman-muthialpet": { name: "முத்தாலம்மன் கோயில்", street: "முத்தியால்பேட்டை" },
};

export const templeTa = (id: string, english: string) => TEMPLES[id]?.name ?? english;
export const templeShortTa = (id: string, english: string) => {
  const t = TEMPLES[id];
  return t ? (t.short ?? t.name.replace(/ கோயில்$/, "")) : english;
};
export const templeFormalTa = (id: string) => TEMPLES[id]?.formal;
export const streetTa = (id: string, english?: string) => TEMPLES[id]?.street ?? english;

export const KINDS_TA: Record<string, string> = {
  article: "கட்டுரை",
  film: "காணொளி",
  interview: "நேர்காணல்",
  video: "காணொளி",
  audio: "ஒலிப்பதிவு",
  photos: "புகைப்படங்கள்",
};
