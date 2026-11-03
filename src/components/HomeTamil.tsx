"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* The home page's name: the large ஸ்தலம், and under it "Sthalam · a sacred
   site", with a video playing through the letters of ஸ்தலம் and through a
   play button at the end of the line under it: black letters for three
   seconds, then the video dissolves into them and the button comes in
   (site.css, .home-mark).
   The letters and the button are the window: the video plays under the
   whole name, and over it a layer the page's colour, holding the letters
   and the button in black, blended "lighten", so that only they let the
   video through. The line "Sthalam · a sacred site" lies over all of it as
   it is (a copy of it, unseen, keeps its place in the layer under).
   The button opens the video in a pop-up, with its sound. Not for those who
   prefer less motion: the letters stay black, and the button comes in
   without the video through it. */

const BLACK_FOR = 3000; // ms of black letters before the video comes in

function Name({ hidden = false }: { hidden?: boolean }) {
  return (
    <p className="home-name" aria-hidden={hidden || undefined}>
      <span className="home-latin">Sthalam</span>
      <span className="home-gloss">
        {/* the red mark between them: a lingam on its base */}
        <span className="home-lingam" aria-hidden="true" />a sacred site
      </span>
    </p>
  );
}

export function HomeMark({ video }: { video?: string }) {
  const clip = useRef<HTMLVideoElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setShown(true), BLACK_FOR);
      return () => window.clearTimeout(t);
    }
    const v = clip.current;
    if (!v) return;
    let ready = false;
    let waited = false;
    const show = () => ready && waited && setShown(true);
    const timer = window.setTimeout(() => {
      waited = true;
      show();
    }, BLACK_FOR);
    const playing = () => {
      ready = true;
      show();
    };
    v.addEventListener("playing", playing);
    v.play().catch(() => undefined);
    return () => {
      window.clearTimeout(timer);
      v.removeEventListener("playing", playing);
    };
  }, [video]);

  // the play button's circle resting on the line "a sacred site" stands on: how far
  // above the foot of the name that line is (site.css, .home-play, --lift)
  useLayoutEffect(() => {
    const m = mark.current;
    const gloss = m?.querySelector<HTMLElement>(":scope > .home-name .home-gloss");
    if (!m || !gloss) return;
    const place = () => {
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      gloss.appendChild(probe);
      const lift = m.getBoundingClientRect().bottom - probe.getBoundingClientRect().bottom;
      probe.remove();
      m.style.setProperty("--lift", `${Math.max(0, lift)}px`);
    };
    place();
    document.fonts?.ready.then(place);
    const ro = new ResizeObserver(place);
    ro.observe(m);
    return () => ro.disconnect();
  }, []);

  const play = () => {
    setOpen(true);
    viewer.current?.showModal();
  };

  return (
    <div ref={mark} className={`home-mark${video ? " with-video" : ""}${shown ? " shown" : ""}`}>
      {video && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video ref={clip} className="home-mark-video" src={video} muted loop playsInline preload="auto" aria-hidden="true" />
      )}
      <div className="home-mark-window">
        <p className="home-tamil" lang="ta">
          ஸ்தலம்
        </p>
        <div className="home-name-row">
          <Name hidden={Boolean(video)} />
          {video && (
            <button type="button" className="home-play" onClick={play} aria-label="Play the film">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="22" />
                <path d="M19 15.5 L34 24 L19 32.5 Z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {video && (
        <>
          <Name />
          <dialog
            ref={viewer}
            className="home-film"
            onClose={() => setOpen(false)}
            onClick={(e) => e.target === viewer.current && viewer.current?.close()}
          >
            <button type="button" className="day-close" onClick={() => viewer.current?.close()} aria-label="Close">
              ×
            </button>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            {open && <video src={video} controls autoPlay playsInline />}
          </dialog>
        </>
      )}
    </div>
  );
}
