/* The site's spellings of words written several ways: each pattern below,
   wherever it is found in what is written (not in web addresses), becomes
   the spelling given. Used to correct what is there (migrations) and what
   is brought in (imports). Words written all in capitals are left as they
   are. */

export const SPELLINGS: [RegExp, string][] = [
  [/\bamaa?vaa?s(?:ai|ay|aya|ya|yai)\b/gi, "Amavasya"],
  [/\b(?:kriitikai|krittikai|krithigai|krithikai|kiruthigai|krittigai|kritigai)\b/gi, "Krittikai"],
  [/\bvedh?apur[ie]e?swarar?\b/gi, "Vedapuriswara"],
  [/\bnandh?ik[ae]?eswarar?\b/gi, "Nandhikeswara"],
  [/\bkailaya\s+v[aā]+[dt]h?[iy]+a?m\b/gi, "Kailaya Vadyam"],
  [/\bdh?[wv]aja+rohanam\b/gi, "Dhvajarohanam"],
  [/\bdh?[wv]ajavarohanam\b/gi, "Dhvajavarohanam"],
  [/\bgurukkal\b/gi, "Gurukkal"],
];

/** `text` with the site's spellings. */
export function spell(text: string): string {
  let out = text;
  for (const [re, word] of SPELLINGS) out = out.replace(re, (m) => (m.length > 1 && m === m.toUpperCase() ? m : word));
  return out;
}
