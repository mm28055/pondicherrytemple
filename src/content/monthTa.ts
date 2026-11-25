/* The words of a month's calendar in Tamil (components/MonthCalendar and
   those beside it, in the visitor's browser). */

export const CAL_TA = {
  year: "ஆண்டு",
  month: "மாதம்",
  none: (month: string, year: number) => `${month} ${year}: இன்னும் எந்த நாளும் பதிவாகவில்லை.`,
  nothing: "இந்நாளில் எதுவும் பதிவாகவில்லை.",
  then: "பிறகு",
  tbc: "உறுதியாக வேண்டும்",
  tbcIs: "இன்னும் உறுதியாகவில்லை",
  close: "மூடுக",
  before: "முந்தைய நாள்",
  after: "அடுத்த நாள்",
  recorded: (n: number) => `${n} ${n === 1 ? "பதிவு" : "பதிவுகள்"}`,
  // the week
  today: "இன்று",
  days: "வாரத்தின் நாட்கள்",
  weekly: "வாரந்தோறும்",
  nothingWeekly: (day: string) => `${day}: இன்னும் எதுவும் பதிவாகவில்லை.`,
  morePhotos: "மேலும் படங்கள்",
};
