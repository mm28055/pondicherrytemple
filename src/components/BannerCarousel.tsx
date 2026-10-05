"use client";

import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";

export type BannerPhoto = { id: string; src: string; alt: string; caption?: string; focus: [number, number] };

/** A band of photographs across the whole width of the page, under its
    heading: one at a time, fading from one to the next every few seconds.
    Pointing at it holds it still; the arrows, the dots, or a swipe go to
    another. Someone who has asked their computer for less movement sees it
    still, and moves it themselves. */
export function BannerCarousel({ photos }: { photos: BannerPhoto[] }) {
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const touch = useRef<number | null>(null);
  const n = photos.length;
  const go = (by: number) => setAt((i) => (i + by + n) % n);

  useEffect(() => {
    if (n < 2 || held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setAt((i) => (i + 1) % n), 5000);
    return () => window.clearInterval(t);
  }, [n, held]);

  if (n === 0) return null;
  return (
    <section
      className="banner"
      aria-roledescription="carousel"
      aria-label="Photographs"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onTouchStart={(e: TouchEvent) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e: TouchEvent) => {
        const x = touch.current;
        touch.current = null;
        if (x === null) return;
        const dx = e.changedTouches[0].clientX - x;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      {photos.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          className={`banner-slide${i === at ? " shown" : ""}`}
          src={p.src}
          alt={i === at ? p.alt : ""}
          loading={i === 0 ? "eager" : "lazy"}
          style={{ objectPosition: `${p.focus[0]}% ${p.focus[1]}%` } as CSSProperties}
        />
      ))}
      {photos[at].caption && <p className="banner-caption">{photos[at].caption}</p>}
      {n > 1 && (
        <>
          <button type="button" className="banner-step prev" onClick={() => go(-1)} aria-label="Previous photograph">
            ‹
          </button>
          <button type="button" className="banner-step next" onClick={() => go(1)} aria-label="Next photograph">
            ›
          </button>
          <div className="banner-dots">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Photograph ${i + 1} of ${n}`}
                aria-current={i === at}
                onClick={() => setAt(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
