/** Words as they are searched: without capitals or Latin marks, and with the
    spellings that vary in writing Tamil and Sanskrit words in English brought
    to one form, so that Aadi finds Adi, Koil finds Koyil and Kovil, Muthu finds
    Mutthu, Azhwar finds Alwar and Alvar, and Mariamman finds Mariyamman. The same is done
    to the text and to what is typed. Tamil script is left as it is: its vowel
    signs are letters of their own. */
export function searchForm(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/kovil/g, "koil")
    .replace(/v/g, "w")
    .replace(/th/g, "t")
    .replace(/dh/g, "d")
    .replace(/bh/g, "b")
    .replace(/sh/g, "s")
    .replace(/zh/g, "l")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/(\p{L})\1+/gu, "$1")
    .replace(/([aeiou])y(?=[aeiou])/g, "$1")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ");
}

/** What is typed, as words to find: each must be there. */
export const searchTerms = (typed: string) => searchForm(typed).split(/\s+/).filter(Boolean);

/** Whether text (in its search form, with a space at each end) has a word
    typed. It must start a word, or, if longer than three letters, end one, so
    that "utsavam" finds Brahmotsavam; never in the middle, where "march" would
    find Kunkumarchana and "adi" a hundred others. */
export const hasTerm = (text: string, term: string) => text.includes(` ${term}`) || (term.length > 3 && text.includes(`${term} `));

/** Whether text starts a word with what is typed: for suggestions, where a
    match must be plain to see. */
export const startsWord = (text: string, term: string) => text.includes(` ${term}`);

/** How many slips a word of this length may have and still be taken for
    another: none under four letters, where too much would match. */
export const slipsFor = (n: number) => (n < 4 ? 0 : n < 6 ? 1 : n < 9 ? 2 : 3);

/** The number of letters to add, drop, change or swap round to turn a into b,
    or max + 1 once it is clearly more than max. */
export function slips(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  let prev2: number[] = [];
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let least = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < least) least = v;
    }
    if (least > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[n];
}

/** The words of a vocabulary (word → how many notes have it) near a term:
    those with the fewest slips, and those with one more that are themselves a
    slip from one of them (Pecchayiamman's spellings, not Ellaiamman); the most
    used first. With `start`, the term is taken as the start of a word still
    being typed, and matched against words' starts. */
export function nearestWords(term: string, vocab: Map<string, number>, start = false, most = 3): string[] {
  const max = slipsFor(term.length);
  if (!max) return [];
  const found: [string, number, number][] = [];
  for (const [w, count] of vocab) {
    if (w === term || !count) continue;
    if (start && w.length < term.length - max) continue;
    const d = start
      ? Math.min(...[-1, 0, 1].map((k) => slips(term, w.slice(0, term.length + k), max)))
      : slips(term, w, max);
    if (d <= max) found.push([w, d, count]);
  }
  if (!found.length) return [];
  const best = Math.min(...found.map((f) => f[1]));
  const first = found.filter((f) => f[1] === best);
  const next = found.filter((f) => f[1] === best + 1 && first.some((b) => slips(b[0], f[0], 1) <= 1));
  return [...first, ...next]
    .sort((a, b) => b[2] - a[2])
    .slice(0, most)
    .map(([w]) => w);
}
