import type { CSSProperties } from "react";

/* A title's longest word, for the stylesheet: long temple names and Sanskrit
   compounds take a size that keeps them within a phone's width. */
export const titleFit = (title: string) =>
  ({ "--long": Math.max(...title.split(/[\s-]+/).map((word) => word.length)) }) as CSSProperties;
