/* The hidden names on the Tamil pages: of buttons that are only a picture
   (×, ‹ ›, the menu's lines) and of drawings, read out by screen readers. */

export const HIDDEN_TA = {
  main: "முதன்மைப் பட்டியல்",
  language: "மொழி",
  menu: "பட்டியல்",
  home: "ஸ்தலம் — முகப்பு",
  close: "மூடுக",
  photo: "புகைப்படம்",
  photoBefore: "முந்தைய புகைப்படம்",
  photoAfter: "அடுத்த புகைப்படம்",
  dayPhotos: (n: string) => `இந்நாளின் எல்லாப் புகைப்படங்களும் (${n})`,
  note: (title: string) => `களக்குறிப்பு: ${title}`,
  film: "காணொளி",
  filmBefore: "முந்தைய காணொளி",
  filmAfter: "அடுத்த காணொளி",
  layoutBefore: "முந்தைய வரைபடம்",
  layoutAfter: "அடுத்த வரைபடம்",
  rituals: "கோயிலின் வழிபாட்டு நாட்காட்டி",
  notOnly: (name?: string) => `${name} மட்டுமன்றி எல்லாவற்றையும் காட்டுக`,
};

/** The months' drawings (components/MonthMotif). */
export const MOTIFS_TA: Record<string, string> = {
  chithirai: "தவனம்",
  vaikasi: "முருகனின் வேல்",
  aani: "நடராஜரின் தீ வளையம்",
  aadi: "அம்மனின் கண்களும் திரிசூலமும்",
  aavani: "கொழுக்கட்டை",
  purattasi: "பெருமாளின் நாமம்",
  aippasi: "முதல் மழை",
  karthigai: "கார்த்திகை விளக்குகள்",
  margazhi: "கோலம்",
  thai: "பொங்கல் பானையும் கரும்பும்",
  masi: "கடலின் மேல் முழுநிலவு",
  panguni: "மாவிலைத் தோரணம்",
};

/** The photographs' credits, by the English. */
export const CREDITS_TA: Record<string, string> = {
  "Photograph courtesy Dewan Kandappa": "புகைப்பட உதவி: திவான் கந்தப்பா",
  "Courtesy Sriram Sharma": "உதவி: ஸ்ரீராம் சர்மா",
  "Photograph: Debbie Wastie": "புகைப்படம்: டெபி வேஸ்டி",
};
