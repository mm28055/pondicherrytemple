/* The Festivals & Rituals page and the Calendar in Tamil (/ta). The names of
   the festivals, rituals and months stay as on the English pages, in both
   languages (the user, 25 November 2026); the rest by the user's guidelines,
   for the user's review. */

export const FESTIVALS_TA = {
  title: "திருவிழாக்கள், வழிபாடுகள்",
  kicker: "வழிபாட்டு ஆண்டு",
  soon: "விரைவில்",
  // until the festivals' own pages are published
  lede: "நாங்கள் உடனிருந்த திருவிழாக்களும் வழிபாடுகளும்: தொடர்புடைய எல்லா விவரங்களுடனும் விவரித்து விளக்கியவை; எங்கள் களக்குறிப்புகளுடனும், அந்நிகழ்வின் புகைப்படங்களுடனும், காலப்போக்கில் இன்னும் நீண்ட கட்டுரைகளுடனும் பிற தொகுத்தாய்வுகளுடனும் இணைந்தவை. களத்தில் ஆழ்ந்திருக்கும் எங்கள் முழு ஆண்டு நிறைவடைந்ததும் தொகுத்து வெளியிடுவோம். இப்போதைக்கு, ",
  ledeLink: "எங்கள் களக்குறிப்புகளைப் பின்தொடருங்கள் →",
  // once they are
  intro:
    "நாங்கள் உடனிருந்த திருவிழாக்களும் வழிபாடுகளும். ஒவ்வொன்றும் ஒருமுறை விளக்கம் பெறுகிறது; அதைக் கண்ட ஒவ்வொரு கோயிலிலிருந்தும், அதைப் பற்றிய எல்லாக் களக்குறிப்புகளையும் கட்டுரைகளையும் ஒன்றுசேர்க்கிறது.",
  festivals: "திருவிழாக்கள்",
  rituals: "வழிபாடுகள்",
  festival: "திருவிழா",
  ritual: "வழிபாடு",
  search: "தேடுக",
  searchLabel: "திருவிழாக்களிலும் வழிபாடுகளிலும் தேடுக",
  nothing: "எதுவும் கிடைக்கவில்லை",
  found: (n: number) => `${n} ${n === 1 ? "கிடைத்தது" : "கிடைத்தன"}`,
  temples: (n: number) => `${n} ${n === 1 ? "கோயில்" : "கோயில்கள்"}`,
};

/** A few words on each, as written in the admin, by its English. */
const GLOSSES: Record<string, string> = {
  "To be written": "எழுதப்பட வேண்டும்",
  "special worship for the month of Aadi": "ஆடி மாதத்திற்கான சிறப்பு வழிபாடு",
  "the yearly celebration of a temple's consecration": "கோயிலின் கும்பாபிஷேகத்தை ஆண்டுதோறும் கொண்டாடுவது",
  "the annual festival of the Draupadi Amman temple worship tradition": "திரௌபதி அம்மன் கோயில் வழிபாட்டு மரபின் ஆண்டுத் திருவிழா",
  "Festivals to the Alvar Saints in Sri Vaishnava traditions": "ஸ்ரீவைஷ்ணவ மரபுகளில் ஆழ்வார்களுக்கான திருவிழாக்கள்",
  "Various community groups gathering to sing or recite verses at different temples":
    "பல சமூகக் குழுக்கள் வெவ்வேறு கோயில்களில் கூடிப் பாடுவதும் ஓதுவதும்",
  "the great annual festival": "பெரும் ஆண்டுத் திருவிழா",
  "the festival of the davanam plant": "தவனச் செடியின் திருவிழா",
  "Annual homage to the post-Ramanuja Vaishnava saint, poet, philosopher Vedanta Desikar":
    "ராமானுஜருக்குப் பிந்தைய வைணவ அருளாளரும் கவிஞரும் தத்துவ அறிஞருமான வேதாந்த தேசிகருக்கு ஆண்டுதோறும் செய்யும் வணக்கம்",
  "the hoisting of the temple flag": "கோயில் கொடியேற்றம்",
  "the fire offering": "தீயில் இடும் படையல்",
  "Offering of Kunkuma accompanied by Lalita Sahasra Namavali or Lalita Trisati Archanai recitation":
    "லலிதா சஹஸ்ர நாமாவளி அல்லது லலிதா திரிசதி அர்ச்சனைப் பாராயணத்துடன் குங்குமம் சமர்ப்பித்தல்",
  "a hundred thousand lamps": "ஒரு லட்சம் விளக்குகள்",
  "the appearance of Narasimha": "நரசிம்மரின் தோற்றம்",
  "9-day festival marking the Goddess Durga's victory over Mahishasura on the 10th day, Vijaya Dashami":
    "10ஆம் நாளான விஜயதசமியில் துர்க்கை அம்மன் மகிஷாசுரனை வென்றதைக் குறிக்கும் 9 நாள் திருவிழா",
  "Worship of the nine enclosures of the Sri Chakra or directed to Lalita Tripurasundari, with Kunkumam":
    "ஸ்ரீ சக்கரத்தின் ஒன்பது ஆவரணங்களுக்கு, அல்லது லலிதா திரிபுரசுந்தரிக்கு, குங்குமத்தால் செய்யும் வழிபாடு",
  "Festivals honouring one or more Nayanmars": "நாயன்மார் ஒருவரையோ பலரையோ போற்றும் திருவிழாக்கள்",
  "twilight worship of Siva, twice a month": "மாதம் இருமுறை, அந்தி நேரத்தில் சிவ வழிபாடு",
  "The deity circumambulates within the temple (ul-purappadu) or goes on a street procession (Thiruveethi purappadu)":
    "தெய்வம் கோயிலுக்குள் வலம் வருதல் (உள் புறப்பாடு), அல்லது வீதியில் ஊர்வலம் செல்லுதல் (திருவீதிப் புறப்பாடு)",
  "the festival of the saint Ramanuja": "அருளாளர் ராமானுஜரின் திருவிழா",
  "The grandest of processional rituals, in which deities are brought out in their wooden chariots and pulled by devotees":
    "ஊர்வல வழிபாடுகளில் மிகவும் கம்பீரமானது; தெய்வங்கள் தங்கள் மரத் தேர்களில் வெளியே வர, பக்தர்கள் தேரை இழுக்கிறார்கள்",
  "the bath from conches": "சங்குகளிலிருந்து நீராட்டு",
  "the sacred bath in the waters": "நீர்நிலையில் புனித நீராடல்",
  "the float festival": "தெப்பத் திருவிழா",
  "the divine wedding": "தெய்வத் திருமணம்",
  "the sacred bath of the deity": "தெய்வத்தின் புனித நீராட்டு",
  "the deity on the swing": "ஊஞ்சலில் தெய்வம்",
  "Pujas linked to specific days of the week, which recur weekly": "வாரத்தின் குறிப்பிட்ட நாட்களுடன் தொடர்புடைய, வாரந்தோறும் வரும் பூசைகள்",
  "the Tamil New Year": "தமிழ்ப் புத்தாண்டு",
};
export const glossTa = (english: string) => GLOSSES[english.trim().replace(/’/g, "'").replace(/\s+/g, " ")] ?? english;

export const CALENDAR_TA = {
  title: "நாட்காட்டி",
  back: "திருவிழாக்கள், வழிபாடுகள்",
  year: "ஆண்டு",
  now: "இப்போது",
  kicker: "வழிபாட்டு ஆண்டு",
  open: "ஒரு மாதத்தில் கோயில்கள் கடைப்பிடிப்பவற்றைக் காண, அம்மாதத்தைத் திறக்கவும்.",
  before: "ஆவணப்படுத்தல் தொடங்குவதற்கு முன்",
  yearBefore: (y: string) => `முந்தைய ஆண்டு, ${y}`,
  yearAfter: (y: string) => `அடுத்த ஆண்டு, ${y}`,
};

const MONTHS: Record<string, string> = {
  January: "ஜனவரி", February: "பிப்ரவரி", March: "மார்ச்", April: "ஏப்ரல்", May: "மே", June: "ஜூன்",
  July: "ஜூலை", August: "ஆகஸ்ட்", September: "செப்டம்பர்", October: "அக்டோபர்", November: "நவம்பர்", December: "டிசம்பர்",
};
/** "mid-April to mid-May" */
export const spanTa = (english: string) => english.replace(/mid-(\w+) to mid-(\w+)/, (_, a, b) => `நடு ${MONTHS[a] ?? a} – நடு ${MONTHS[b] ?? b}`);
