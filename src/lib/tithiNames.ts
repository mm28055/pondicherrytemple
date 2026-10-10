/* The tithis kept on the month's calendar: their names, in English and in
   Tamil, and the icon each
   is shown by (stand-ins, until the icons are drawn). The days they fall on
   are worked out in tithi.ts, on the server. Pournami and Amavasya keep the
   white and black discs the calendar has always had. */

export type TithiKey =
  | "vinayaka-chaturthi"
  | "panchami-s"
  | "shashti"
  | "pradosham-s"
  | "pournami"
  | "sankatahara-chaturthi"
  | "panchami-k"
  | "ashtami-k"
  | "pradosham-k"
  | "shivaratri"
  | "amavasya";

export const TITHI_NAMES: Record<TithiKey, { name: string; tamil: string; icon: string }> = {
  // valarpirai (shukla paksha), to the full moon
  "vinayaka-chaturthi": { name: "Vinayaka Chaturthi", tamil: "விநாயக சதுர்த்தி", icon: "🐘" },
  "panchami-s": { name: "Valarpirai Panchami", tamil: "வளர்பிறை பஞ்சமி", icon: "🐍" },
  shashti: { name: "Shashti", tamil: "சஷ்டி", icon: "🦚" },
  "pradosham-s": { name: "Pradosham", tamil: "பிரதோஷம்", icon: "🐂" },
  pournami: { name: "Pournami", tamil: "பௌர்ணமி", icon: "" },
  // theipirai (krishna paksha), to the new moon
  "sankatahara-chaturthi": { name: "Sankatahara Chaturthi", tamil: "சங்கடஹர சதுர்த்தி", icon: "🐀" },
  "panchami-k": { name: "Theipirai Panchami", tamil: "தேய்பிறை பஞ்சமி", icon: "🐍" },
  "ashtami-k": { name: "Theipirai Ashtami", tamil: "தேய்பிறை அஷ்டமி", icon: "🐕" },
  "pradosham-k": { name: "Pradosham", tamil: "பிரதோஷம்", icon: "🐂" },
  shivaratri: { name: "Masa Shivaratri", tamil: "மாத சிவராத்திரி", icon: "🔱" },
  amavasya: { name: "Amavasya", tamil: "அமாவாசை", icon: "" },
};
