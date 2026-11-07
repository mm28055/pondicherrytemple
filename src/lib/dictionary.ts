/* The site's dictionary in the field notes: the first use of each word in a
   note is marked, and components/GlossCard shows its meaning. Only the text
   between tags is touched, and not within links, headings, quoted passages or
   captions. Tamil and Sanskrit script is never matched. */

export type DictionaryEntry = { word: string; alsoWritten?: string | null; meaning: string; exactCase?: boolean | null };

export type Dictionary = { forms: Map<string, { entry: DictionaryEntry; form: string }>; pattern: RegExp | null };

const attr = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function buildDictionary(entries: DictionaryEntry[]): Dictionary {
  const forms: Dictionary["forms"] = new Map();
  for (const entry of entries) {
    for (const form of [entry.word, ...(entry.alsoWritten ?? "").split(",")].map((f) => f.trim()).filter(Boolean)) {
      forms.set(form.toLowerCase(), { entry, form });
    }
  }
  const words = [...forms.keys()]
    .sort((a, b) => b.length - a.length)
    .map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[ -]/g, "[ -]"));
  // not inside a longer word, and not an entity such as &amp;
  const pattern = words.length ? new RegExp(`(?<![A-Za-z&#])(${words.join("|")})(s?)(?![A-Za-z])`, "gi") : null;
  return { forms, pattern };
}

const SKIP = /^<(\/?)(a|h[1-6]|figcaption|blockquote)\b/i;

/** `html` with the first use of each dictionary word marked. */
export function markDictionary(html: string, { forms, pattern }: Dictionary): string {
  if (!pattern || !html) return html;
  const seen = new Set<string>();
  let skipping = 0;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        const tag = SKIP.exec(part);
        if (tag) skipping = Math.max(0, skipping + (tag[1] ? -1 : 1));
        return part;
      }
      if (skipping) return part;
      return part.replace(pattern, (match, word: string, plural: string) => {
        const lower = word.toLowerCase();
        const found = forms.get(lower) ?? forms.get(lower.replace(/-/g, " ")) ?? forms.get(lower.replace(/ /g, "-"));
        if (!found || seen.has(found.entry.word)) return match;
        if (found.entry.exactCase && word !== found.form) return match;
        seen.add(found.entry.word);
        return `<span class="dict-word" tabindex="0" role="button" data-w="${attr(found.entry.word)}" data-m="${attr(found.entry.meaning)}">${word}${plural}</span>`;
      });
    })
    .join("");
}
