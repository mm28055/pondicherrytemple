"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* The home page's name: the large ஸ்தலம், and under it "Sthalam · a sacred
   site", in black letters. Where the home page has a film, a black play
   button stands at the end of the line under it (site.css, .home-play),
   and opens the film large in a pop-up, with its sound and from the start. */

/* Where the letters' ink stands. INK: in ஸ்தலம் as set in the header (Anek
   Tamil 800, 75% width), in ems, from the start of its text and the top of
   its line of type (lineH ems tall), measured 8 Nov 2026. FILM_INK: in the
   film's first frame, as fractions of the frame, measured from its first
   seconds. The two have the same proportions, so one lies on the other. */
const INK = { left: 6 / 205.9, width: 649 / 205.9, top: 41 / 205.9, height: 202 / 205.9, lineH: 290 / 205.9 };
const FILM_INK = { left: 0.15, width: 0.7, top: 0.306, height: 0.383 };
const GROW_FOR = 2600; // ms for the name to grow into the film
const COME_FOR = 900; // ms for the rest of the film, and the black round it, to come in
const CLOSE_FOR = 3500; // ms for the film, once over, to go back into the name, in one movement
const FROST = "rgba(245, 244, 240, 0.74)"; // the page behind the moving name, as the menus frost it (site.css)

function Name() {
  return (
    <p className="home-name">
      <span className="home-latin">Sthalam</span>
      <span className="home-gloss">
        {/* the red mark between them: a lingam on its base */}
        <span className="home-lingam" aria-hidden="true" />a sacred site
      </span>
    </p>
  );
}

export function HomeMark({ film }: { film?: { src: string; poster?: string } }) {
  const mark = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // the play button's circle resting on the line "a sacred site" stands on: how far
  // above the foot of the name that line is (site.css, .home-play, --lift)
  useLayoutEffect(() => {
    const m = mark.current;
    const gloss = m?.querySelector<HTMLElement>(".home-name .home-gloss");
    if (!m || !gloss || !film) return;
    const latin = m.querySelector<HTMLElement>(".home-name .home-latin");
    const place = () => {
      // the circle as tall as the red STHALAM's capitals (a touch over, as a
      // round letter is), and centred on the capitals of "Watch the film"
      // beside it: so its foot a little below the line their letters stand on
      let below = 0;
      const label = m.querySelector<HTMLElement>(".home-play-label");
      const g = document.createElement("canvas").getContext("2d");
      const capOf = (el: HTMLElement) => {
        if (!g) return 0;
        const cs = getComputedStyle(el);
        g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        return g.measureText("H").actualBoundingBoxAscent;
      };
      const cap = latin ? capOf(latin) : 0;
      if (cap > 0) {
        const size = Math.round(cap * 1.04 * 2) / 2;
        m.style.setProperty("--cap", `${size}px`);
        below = Math.max(0, size / 2 - (label ? capOf(label) : 0) / 2);
        m.style.setProperty("--below", `${below}px`);
      }
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      gloss.appendChild(probe);
      const line = probe.getBoundingClientRect().bottom;
      probe.remove();
      let lift = m.getBoundingClientRect().bottom - line;
      m.style.setProperty("--lift", `${Math.max(0, lift)}px`);
      // and its foot on that line exactly (the label's letters below their line
      // would otherwise hold the button, and so the circle, up off it)
      const circle = m.querySelector(".home-play svg");
      if (circle) {
        lift += circle.getBoundingClientRect().bottom - (line + below);
        m.style.setProperty("--lift", `${Math.max(0, lift)}px`);
      }
    };
    place();
    document.fonts?.ready.then(place);
    const ro = new ResizeObserver(place);
    ro.observe(m);
    return () => ro.disconnect();
  }, [film]);

  const hold = (on: boolean) => {
    const m = mark.current;
    const hero = m?.closest<HTMLElement>(".home-hero");
    if (!m) return;
    m.style.width = on ? `${m.getBoundingClientRect().width}px` : "";
    if (hero) hero.style.paddingTop = on ? getComputedStyle(hero).paddingTop : "";
  };

  const play = () => {
    // the film under the opening words stops, so the two never play at once
    document.querySelectorAll<HTMLVideoElement>("video.home-opening-film").forEach((v) => v.pause());
    const d = viewer.current;
    if (!d) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // the page behind keeps its width while its scrollbar is hidden (site.css),
    // and the name's box and the header's top (set by the window's width) are
    // held as they are: so the name neither moves nor grows as the film comes and goes
    const root = document.documentElement;
    root.style.setProperty("--film-gutter", `${Math.max(0, window.innerWidth - root.clientWidth)}px`);
    hold(true);
    d.classList.add("intro");
    setOpen(true);
    d.showModal();
    // once the film is in the pop-up (a frame or two; longer on a slow phone)
    let frames = 0;
    const begin = () => {
      if (!d.open) return;
      if (!d.querySelector("video") && frames++ < 30) return void requestAnimationFrame(begin);
      if (still) {
        d.querySelector("video")?.play().catch(() => undefined);
        finish(d);
      } else grow(d);
    };
    requestAnimationFrame(() => requestAnimationFrame(begin));
  };

  // the film's controls: shown once it has grown in
  const [ready, setReady] = useState(false);

  /* The name grows into the film: its film opens on the same ஸ்தலம். The
     pop-up (the film filling the screen) starts small, placed so that the
     film's own letters (FILM_INK) lie exactly on the header's, and moves and
     grows to fill the screen, the film's letters on the header's all the way.
     While it moves only its letters are seen: the film shows through the
     shape of ஸ்தலம் alone (a mask of the letters), the page as it is round
     them, and a copy of the header's black letters over them dissolves into
     the film's. Once there, the rest of the film and the black round it
     come in, the page going to black behind. */
  /* Where things stand for the name to grow into the film, or the film to
     shrink back into the name: the film's letters, as a mask, and a copy of
     the header's black letters on them, in the pop-up as it is at full size;
     and the move (small) that puts the pop-up's letters on the header's.
     rest: how much of the film beyond its letters shows at the start. */
  const stage = (d: HTMLDialogElement, rest: 0 | 1) => {
    const from = mark.current?.querySelector<HTMLElement>(".home-tamil");
    const video = d.querySelector("video");
    const close = d.querySelector<HTMLElement>(".day-close");
    if (!from || !video) return null;
    const fs = parseFloat(getComputedStyle(from).fontSize);
    const ink = (box: DOMRect) => ({
      x: box.left + INK.left * fs,
      y: box.top + (box.height - INK.lineH * fs) / 2 + INK.top * fs,
      w: INK.width * fs,
      h: INK.height * fs,
    });
    const range = document.createRange();
    range.selectNodeContents(from);
    const start = ink(range.getBoundingClientRect());

    // where the film's letters stand in the pop-up as it will be (the film
    // kept whole in the screen, black above and below or at the sides)
    const box = video.getBoundingClientRect();
    const fit = Math.min(box.width / 16, box.height / 9);
    const frame = { x: box.left + (box.width - 16 * fit) / 2, y: box.top + (box.height - 9 * fit) / 2, w: 16 * fit, h: 9 * fit };
    const end = {
      x: frame.x + FILM_INK.left * frame.w,
      y: frame.y + FILM_INK.top * frame.h,
      w: FILM_INK.width * frame.w,
      h: FILM_INK.height * frame.h,
    };

    // the black letters, laid on the film's own
    const word = from.textContent?.trim() ?? "";
    const copy = document.createElement("span");
    copy.className = "home-film-name";
    copy.lang = "ta";
    copy.textContent = word;
    copy.style.fontSize = `${fs}px`;
    copy.style.opacity = String(1 - rest);
    d.appendChild(copy);
    const own = copy.getBoundingClientRect();
    const at = ink(own);
    const k = end.w / at.w;
    const cx = end.x - own.left - (at.x - own.left) * k;
    const cy = end.y + (end.h - at.h * k) / 2 - own.top - (at.y - own.top) * k;
    copy.style.transform = `translate(${cx}px, ${cy}px) scale(${k})`;

    // the same letters drawn as the film's mask, exactly where the copy lies
    const cs = getComputedStyle(copy);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = own.width * k;
    const H = own.height * k;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(W * dpr);
    canvas.height = Math.ceil(H * dpr);
    const g = canvas.getContext("2d");
    if (g) {
      g.scale(dpr, dpr);
      // narrow, as the header sets it: named in the font itself (Safari, on an
      // iPhone, has no fontStretch for a canvas), and fontStretch where there is one
      g.font = `${cs.fontWeight} condensed ${fs * k}px ${cs.fontFamily}`;
      if ("fontStretch" in g) g.fontStretch = "condensed";
      let m = g.measureText(word);
      // and if it still comes out wider or narrower than the copy, drawn to the copy's width
      const wide = m.width / W;
      if (Math.abs(wide - 1) > 0.01) {
        g.scale(1 / wide, 1);
        m = g.measureText(word);
      }
      const lineH = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      g.fillStyle = "#000";
      g.fillText(word, 0, (H - lineH) / 2 + m.fontBoundingBoxAscent);
    }
    // (the letters, and over the whole film a layer as clear as --film-rest)
    const shape = `url(${canvas.toDataURL("image/png")})`;
    const layer = "linear-gradient(rgba(0, 0, 0, var(--film-rest)), rgba(0, 0, 0, var(--film-rest)))";
    const masked: [string, string][] = [
      ["mask-image", `${shape}, ${layer}`],
      ["mask-size", `${W}px ${H}px, 100% 100%`],
      ["mask-position", `${cx}px ${cy}px, 0 0`],
      ["mask-repeat", "no-repeat"],
    ];
    for (const [p, v] of masked) {
      video.style.setProperty(p, v);
      video.style.setProperty(`-webkit-${p}`, v);
    }
    video.style.setProperty("--film-rest", String(rest));

    // the pop-up, from its top left corner: the film's letters on the header's
    const dr = d.getBoundingClientRect();
    const s = start.w / end.w;
    const tx = start.x - dr.left - (end.x - dr.left) * s;
    const ty = start.y + start.h / 2 - dr.top - (end.y + end.h / 2 - dr.top) * s;
    const small = `translate(${tx}px, ${ty}px) scale(${s})`;

    const tidy = () => {
      copy.remove();
      for (const [p] of masked) {
        video.style.removeProperty(p);
        video.style.removeProperty(`-webkit-${p}`);
      }
      video.style.removeProperty("--film-rest");
    };
    return { from, video, close, copy, small, tidy };
  };

  const clear = "rgba(0, 0, 0, 0)";
  const black = "rgb(0, 0, 0)";
  const move = { duration: GROW_FOR, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "both" as const };
  const come = { duration: COME_FOR, easing: "ease-in-out", fill: "both" as const };

  const grow = (d: HTMLDialogElement) => {
    const st = stage(d, 0);
    if (!st) return finish(d);
    const { from, video, close, copy, small, tidy } = st;
    from.style.visibility = "hidden";
    video.currentTime = 0;
    video.play().catch(() => undefined);
    const moving = [
      d.animate(
        [
          { transform: small, backgroundColor: clear },
          { transform: "none", backgroundColor: clear },
        ],
        move,
      ),
      // the page behind frosting over as the name sets out, like the menus' frost
      d.animate(
        [
          { backgroundColor: clear, backdropFilter: "blur(0px)", offset: 0 },
          { backgroundColor: FROST, backdropFilter: "blur(9px)", offset: 0.4 },
          { backgroundColor: FROST, backdropFilter: "blur(9px)", offset: 1 },
        ],
        { ...move, easing: "ease-out", pseudoElement: "::backdrop" },
      ),
      video.animate([{ opacity: 0 }, { opacity: 1 }], { ...move, easing: "ease-in-out" }),
      copy.animate([{ opacity: 1 }, { opacity: 0 }], { ...move, easing: "ease-in-out" }),
      ...(close ? [close.animate([{ opacity: 0 }, { opacity: 0 }], move)] : []),
    ];
    d.classList.remove("intro");
    let coming: Animation[] = [];
    Promise.all(moving.map((a) => a.finished))
      .then(() => {
        // the rest of the film and the black round it
        coming = [
          d.animate([{ backgroundColor: clear }, { backgroundColor: black }], come),
          d.animate(
            [
              { backgroundColor: FROST, backdropFilter: "blur(9px)" },
              { backgroundColor: black, backdropFilter: "blur(9px)" },
            ],
            { ...come, pseudoElement: "::backdrop" },
          ),
          video.animate([{ "--film-rest": 0 } as Keyframe, { "--film-rest": 1 } as Keyframe], come),
          ...(close ? [close.animate([{ opacity: 0 }, { opacity: 1 }], come)] : []),
        ];
        moving.forEach((a) => a.cancel());
        copy.remove();
        return Promise.all(coming.map((a) => a.finished));
      })
      .catch(() => undefined)
      .finally(() => {
        moving.forEach((a) => a.cancel());
        coming.forEach((a) => a.cancel());
        tidy();
        from.style.visibility = "";
        if (d.open) finish(d);
      });
  };

  /* The film over: the opening backwards, in one movement. Out of the whole
     screen first (the page at its top behind, so the name is where it
     starts), its controls gone. Then, on one timeline: the film beyond its
     letters goes into the black; the black eases to the page frosted behind,
     as the letters set out; they shrink back into the header's, the header's
     black letters coming up over them, the frost clearing as they arrive; and
     the pop-up closes on the home page as it was. The black and the frost are
     only on the layer behind (::backdrop), which fills the window and never
     moves: the pop-up and its film carry no colour of their own, so no edge of
     theirs can show. The film's last frame is held as it shrinks. */
  const ending = useRef(false);
  const shrink = async () => {
    const d = viewer.current;
    if (!d?.open || ending.current) return;
    ending.current = true;
    setReady(false);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      // (the window back at its own size before anything is measured)
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = still ? null : stage(d, 1);
    if (!st) {
      ending.current = false;
      return d.close();
    }
    const { from, video, close, copy, small, tidy } = st;
    from.style.visibility = "hidden";
    // (the black now the layer behind's alone: the same to see)
    d.style.backgroundColor = "transparent";
    video.style.backgroundColor = "transparent";
    const all = { duration: CLOSE_FOR, easing: "linear", fill: "both" as const };
    const soft = "ease-in-out";
    const glide = "cubic-bezier(0.4, 0, 0.2, 1)";
    let going: Animation[] = [];
    try {
      going = [
        // the film beyond its letters, into the black
        video.animate(
          [
            { "--film-rest": 1, offset: 0, easing: soft } as Keyframe,
            { "--film-rest": 0, offset: 0.26 } as Keyframe,
            { "--film-rest": 0, offset: 1 } as Keyframe,
          ],
          all,
        ),
        // the black to the frost, then the frost clearing as the name arrives
        d.animate(
          [
            { backgroundColor: black, backdropFilter: "blur(9px)", offset: 0 },
            { backgroundColor: black, backdropFilter: "blur(9px)", offset: 0.1, easing: soft },
            { backgroundColor: FROST, backdropFilter: "blur(9px)", offset: 0.52 },
            { backgroundColor: FROST, backdropFilter: "blur(9px)", offset: 0.74, easing: "ease-in" },
            { backgroundColor: clear, backdropFilter: "blur(0px)", offset: 1 },
          ],
          { ...all, pseudoElement: "::backdrop" },
        ),
        // the letters home
        d.animate(
          [
            { transform: "none", offset: 0 },
            { transform: "none", offset: 0.24, easing: glide },
            { transform: small, offset: 1 },
          ],
          all,
        ),
        video.animate(
          [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.45, easing: soft },
            { opacity: 0, offset: 1 },
          ],
          all,
        ),
        copy.animate(
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.45, easing: soft },
            { opacity: 1, offset: 1 },
          ],
          all,
        ),
        ...(close
          ? [
              close.animate(
                [
                  { opacity: 1, offset: 0, easing: "ease-out" },
                  { opacity: 0, offset: 0.15 },
                  { opacity: 0, offset: 1 },
                ],
                all,
              ),
            ]
          : []),
      ];
      await Promise.all(going.map((a) => a.finished));
    } catch {
      // (closed on the way: nothing more to do)
    }
    from.style.visibility = "";
    if (d.open) d.close();
    going.forEach((a) => a.cancel());
    d.style.backgroundColor = "";
    video.style.backgroundColor = "";
    tidy();
    ending.current = false;
  };

  // the film come in: its controls and corner button
  /* The film come in: its controls, and the film itself given the whole
     screen, as its own full-screen button would (the browser's own view and
     controls, as for the film under the opening words). Still within the
     few seconds a browser allows after the press; where it refuses (an
     iPhone, or a slow start) the film stays filling the window, its own
     button there to take it to the whole screen. Leaving the whole screen
     (minimise, or Esc) keeps the film in the window. */
  const finish = (d: HTMLDialogElement) => {
    d.classList.remove("intro");
    setReady(true);
    const video = d.querySelector("video");
    if (video && !document.fullscreenElement) video.requestFullscreen?.({ navigationUI: "hide" }).catch(() => undefined);
  };

  return (
    <div ref={mark} className={`home-mark${film ? " with-film" : ""}`}>
      <p className="home-tamil" lang="ta">
        ஸ்தலம்
      </p>
      <Name />
      {film && (
        <>
          <button type="button" className="home-play" onClick={play}>
            <span className="home-play-label">Watch the film</span>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="21.5" />
              <path d="M19 15.5 L34 24 L19 32.5 Z" />
            </svg>
          </button>
          <dialog
            ref={viewer}
            className="home-film"
            onClose={() => {
              setOpen(false);
              setReady(false);
              hold(false);
              viewer.current?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
              viewer.current?.classList.remove("intro");
              if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
            }}
            onClick={(e) => e.target === viewer.current && viewer.current?.close()}
          >
            <button type="button" className="day-close" onClick={() => viewer.current?.close()} aria-label="Close">
              ×
            </button>
            {/* (started by play; its controls the browser's own, as for the
                film under the opening words, without the download) */}
            {open && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={film.src} poster={film.poster} controls={ready} controlsList="nodownload" playsInline preload="auto" onEnded={shrink} />
            )}
          </dialog>
        </>
      )}
    </div>
  );
}
