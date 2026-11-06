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
