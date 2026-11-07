"use client";

import { useEffect } from "react";

/* The card of a dictionary word (lib/dictionary) above the word: on a computer
   while the word is pointed at or has the keyboard's focus; on a phone from a
   tap until a tap elsewhere, the same word again, or Back (DialogBack: it is a
   <dialog>). A hover is not a step in the history, so a card from a hover is
   marked data-own-history for DialogBack to leave alone. Below the word only
   where there is no room above it under the menu bar. */
export function GlossCard() {
  useEffect(() => {
    const card = document.createElement("dialog");
    card.className = "gloss-card";
    const name = document.createElement("b");
    const meaning = document.createElement("span");
    card.append(name, meaning);
    document.body.append(card);

    const wordOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>(".dict-word") : null);
    let current: HTMLElement | null = null;

    const show = (word: HTMLElement, tapped: boolean) => {
      name.textContent = word.dataset.w ?? "";
      meaning.textContent = word.dataset.m ?? "";
      if (!card.open) card.toggleAttribute("data-own-history", !tapped);
      // not show(): that would take the focus from the word
      card.setAttribute("open", "");
      current = word;
      const at = word.getClientRects()[0];
      const margin = 12;
      const bar = document.querySelector<HTMLElement>("header.nav")?.getBoundingClientRect().bottom ?? 0;
      const left = Math.max(margin, Math.min(at.left, document.documentElement.clientWidth - card.offsetWidth - margin));
      const room = at.top - card.offsetHeight >= Math.max(bar, 0) + 4;
      const top = room ? at.top - card.offsetHeight : at.bottom;
      card.style.left = `${left + window.scrollX}px`;
      card.style.top = `${top + window.scrollY}px`;
    };
    const hide = () => {
      card.removeAttribute("open");
      current = null;
    };

    const hover = window.matchMedia("(hover: hover)");
    const over = (e: MouseEvent) => {
      const word = wordOf(e.target);
      if (word && hover.matches) show(word, false);
    };
    const out = (e: MouseEvent) => {
      if (hover.matches && wordOf(e.target) && document.activeElement !== wordOf(e.target)) hide();
    };
    const focusin = (e: FocusEvent) => {
      const word = wordOf(e.target);
      if (word && hover.matches) show(word, false);
    };
    const focusout = (e: FocusEvent) => {
      if (hover.matches && wordOf(e.target)) hide();
    };
    const click = (e: MouseEvent) => {
      if (hover.matches) return;
      const word = wordOf(e.target);
      if (!word) return void (card.contains(e.target as Node) || (card.open && hide()));
      if (word === current && card.open) hide();
      else show(word, true);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && card.open) hide();
      const word = wordOf(e.target);
      if (word && !hover.matches && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        show(word, true);
      }
    };

    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("focusin", focusin);
    document.addEventListener("focusout", focusout);
    document.addEventListener("click", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("focusin", focusin);
      document.removeEventListener("focusout", focusout);
      document.removeEventListener("click", click);
      document.removeEventListener("keydown", key);
      card.remove();
    };
  }, []);
  return null;
}
