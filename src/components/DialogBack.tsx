"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/* The browser's Back button closes a pop-up, on every page: a photo, a film,
   a temple's layouts, a day of the calendar, and any pop-up added later (any
   <dialog>). Opening one adds a step to the browser's history at the same
   address; Back takes that step, which closes it. Closed any other way (×,
   Escape, a click outside), the step is taken back out, so Back then goes
   where it would have gone. A link inside a pop-up takes the pop-up's step, so
   Back from where it leads returns to the page, not to the pop-up.
   A pop-up that keeps its own place in the history (a photo with its own
   address, components/PhotoWall) is marked data-own-history and left alone. */
export function DialogBack() {
  const router = useRouter();

  useEffect(() => {
    // the open pop-ups this has added a step for, the latest last
    const stack: { dialog: HTMLDialogElement; key: string }[] = [];
    // closed by Back (its step already gone) or by a link (its step taken over)
    const byBack = new WeakSet<HTMLDialogElement>();

    const opened = (dialog: HTMLDialogElement) => {
      if (dialog.hasAttribute("data-own-history") || stack.some((s) => s.dialog === dialog)) return;
      const key = Math.random().toString(36).slice(2);
      stack.push({ dialog, key });
      window.history.pushState({ ...window.history.state, __popup: key }, "", window.location.href);
    };

    const closed = (dialog: HTMLDialogElement) => {
      if (byBack.has(dialog)) return void byBack.delete(dialog);
      const at = stack.findIndex((s) => s.dialog === dialog);
      if (at < 0) return;
      const [{ key }] = stack.splice(at, 1);
      if (window.history.state?.__popup === key) window.history.back();
    };

    // a pop-up opens or closes: its "open" changes
    const watch = new MutationObserver((changes) => {
      for (const c of changes) {
        const el = c.target as HTMLElement;
        if (el.tagName !== "DIALOG") continue;
        const dialog = el as HTMLDialogElement;
        if (dialog.open) opened(dialog);
        else closed(dialog);
      }
    });
    watch.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    // Back (or Forward) to a step without this pop-up: it closes
    const onPop = (e: PopStateEvent) => {
      const here = (e.state as { __popup?: string } | null)?.__popup;
      while (stack.length && stack[stack.length - 1].key !== here) {
        const { dialog } = stack.pop()!;
        if (!dialog.open) continue;
        byBack.add(dialog);
        dialog.close();
      }
    };
    window.addEventListener("popstate", onPop);

    // a link inside a pop-up: the pop-up closes, and the link takes the place of its step
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const dialog = a?.closest("dialog");
      const top = stack[stack.length - 1];
      if (!a || !dialog || top?.dialog !== dialog || window.history.state?.__popup !== top.key) return;
      if (a.target && a.target !== "_self") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || a.hasAttribute("download")) return;
      e.preventDefault();
      e.stopPropagation();
      stack.pop();
      byBack.add(dialog);
      dialog.close();
      router.replace(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      watch.disconnect();
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  return null;
}
