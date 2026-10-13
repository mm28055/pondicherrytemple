/* Icons a special nakshatram or tithi can be shown by in place of its own
   (chosen in the admin): each an image in public/icons. */
export const SPECIAL_ICONS = {
  nataraja: { label: "Nataraja", src: "/icons/nataraja.png", ratio: "251 / 350" },
} as const;
export type SpecialIconKey = keyof typeof SPECIAL_ICONS;
