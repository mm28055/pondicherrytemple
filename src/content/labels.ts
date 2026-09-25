import type { DeityGroup, FieldKind } from "./types";

export const DEITY_GROUP_LABELS: Record<DeityGroup, string> = {
  shiva: "Shiva",
  vishnu: "Vishnu",
  amman: "Amman",
  vinayaka: "Vinayaka",
  murugan: "Murugan",
};

/** Singular and plural labels for the filter on the Field Notes tab. */
export const FIELD_KIND_LABELS: Record<FieldKind, { one: string; many: string }> = {
  note: { one: "Note", many: "Notes" },
  interview: { one: "Interview", many: "Interviews" },
  video: { one: "Video", many: "Videos" },
  audio: { one: "Recording", many: "Recordings" },
  photos: { one: "Photographs", many: "Photographs" },
};
