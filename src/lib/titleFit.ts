import type { CSSProperties } from "react";

/* A title's longest word, for the stylesheet: long temple names and Sanskrit
   compounds take a size that keeps them within a phone's width. */
export const titleFit = (title: string) =>
  ({ "--long": Math.max(...title.split(/[\s-]+/).map((word) => word.length)) }) as CSSProperties;

/* A Tamil letter's or sign's width against the others' (most signs are narrow,
   some stand over their letter), measured in the titles' face. */
const tamilWidth = (c: string) =>
  c === "்" ? 0
  : /[ிீ]/.test(c) ? 0.2
  : /[ுூ]/.test(c) ? 0.3
  : /[ாெேர]/.test(c) ? 0.5
  : /[ொோௌ]/.test(c) ? 1.1
  : /[ணஞஷஜஹஆஐஊஔளஅ]/.test(c) ? 1.2
  : /[னைழமஸ]/.test(c) ? 1
  : 0.8;

/** The same for a field note's title in Tamil. */
export const titleFitTa = (title: string) =>
  ({ "--long": ((1.26 / 0.58) * Math.max(...title.split(/[\s-]+/).map((w) => [...w].reduce((n, c) => n + tamilWidth(c), 0)))).toFixed(1) }) as CSSProperties;
