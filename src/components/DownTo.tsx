"use client";

import { Children, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** A list beside something, as long as reaches down to it: as many of its
    items as end above the top of `target` (the home page's "Just added",
    down to the film beside it), and at least `min`; on a narrow screen,
    where the list is below it, `min`. Measured again as the page changes
    size. */
export function DownTo({ target, min, children }: { target: string; min: number; children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);
  const [shown, setShown] = useState(min);

  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const measure = () => {
      const to = document.querySelector(target)?.getBoundingClientRect();
      const lis = [...ul.children] as HTMLElement[];
      // every item out, to measure where each would end
      lis.forEach((li) => (li.hidden = false));
      const top = ul.getBoundingClientRect().top;
      const n = !to || top >= to.top ? min : Math.max(min, lis.filter((li) => li.getBoundingClientRect().bottom <= to.top).length);
      // (put back at once, as well as kept: the count may be the same as before)
      lis.forEach((li, i) => (li.hidden = i >= n));
      setShown(n);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [target, min]);

  return (
    <ul ref={list}>
      {items.map((item, i) => (
        <li key={i} hidden={i >= shown}>
          {item}
        </li>
      ))}
    </ul>
  );
}
