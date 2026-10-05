"use client";

import { useState } from "react";
import type { Photo } from "@/content/types";
import { PhotoWall } from "@/components/PhotoWall";
import { MAHOTSAVAM_PARTS } from "@/lib/mahotsavam";

/* The elements of the mahotsavam, in three parts (before it begins; its
   defining elements; its concluding events), each part a list of rites.
   Bookmarks at the top lead to each part. Each rite shows the first three lines of its text, fading out, with
   "Read more" to open it in place, and "Read less" to fold it again.
   The texts are dummy text for now, 300 words each. */

const LOREM = (
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. " +
  "Curabitur pretium tincidunt lacus, nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. " +
  "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. " +
  "Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. " +
  "Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. " +
  "Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. " +
  "Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. " +
  "In hac habitasse platea dictumst. Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. " +
  "Curabitur non elit ut libero tristique sodales. Mauris a lacus. Donec mattis semper leo. Vivamus facilisis diam at odio. " +
  "Mauris dictum, nisi eget consequat elementum, lacus ligula molestie metus, non feugiat orci magna ac sem. Donec turpis. Donec vitae metus. " +
  "Morbi tristique neque eu mauris. Quisque gravida ipsum non sapien. Proin turpis lacus, scelerisque vitae, elementum at, lobortis ac, quam. " +
  "Aliquam dictum eleifend risus. Etiam sit amet diam. Suspendisse odio. Suspendisse nunc. In semper bibendum libero. " +
  "Proin nonummy, lacus eget pulvinar lacinia, pede felis dignissim leo, vitae tristique magna lacus sit amet eros. Nullam ornare. " +
  "Praesent odio ligula, dapibus sed, tincidunt eget, dictum ac, nibh. Nam quis lacus. Nunc eleifend molestie velit. Morbi lobortis quam eu velit."
).split(" ");

/** 300 words of dummy text, in two paragraphs, starting at a different
    place for each rite so they do not all read the same. */
function dummy(start: number): string[] {
  const words = Array.from({ length: 300 }, (_, i) => LOREM[(start + i) % LOREM.length]);
  const text = (from: number, to: number) => {
    const t = words.slice(from, to).join(" ").replace(/[,;]$/, "");
    return t.charAt(0).toUpperCase() + t.slice(1).replace(/[^.]$/, (c) => c + ".");
  };
  return [text(0, 160), text(160, 300)];
}

const PARTS = MAHOTSAVAM_PARTS;

/** `strips`: each rite's photographs, by its name, shown as a contact strip
    under its name (for now, dummy photographs). */
export function MahotsavamElements({ strips = {} }: { strips?: Record<string, Photo[]> }) {
  let n = 0;
  return (
    <div className="elements-parts">
      {/* bookmarks: straight to each part */}
      <nav className="elements-marks" aria-label="The parts of the mahotsavam">
        {PARTS.map((part) => (
          <a key={part.id} href={`#${part.id}`}>
            {part.mark}
          </a>
        ))}
      </nav>
      {PARTS.map((part) => (
        <section key={part.title} id={part.id} className="elements-part">
          <h3 className="elements-part-title">{part.title}</h3>
          {part.rites.map((rite) => (
            <Rite key={rite} name={rite} text={dummy((n++ * 37) % LOREM.length)} photos={strips[rite]} />
          ))}
        </section>
      ))}
    </div>
  );
}

function Rite({ name, text, photos }: { name: string; text: string[]; photos?: Photo[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rite${open ? " open" : ""}`}>
      <h4 className="rite-name">{name}</h4>
      {/* its photographs, small, in rows; each opens large, to step through them all */}
      {photos && photos.length > 0 && <PhotoWall photos={photos} layout="strip" />}
      <div className="rite-text prose">
        {text.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <button type="button" className="rite-more" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Read less" : "Read more"}
      </button>
    </div>
  );
}
