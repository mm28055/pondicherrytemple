"use client";

import { useEffect } from "react";

/** The site's photographs and drawings not offered for saving or copying:
    right-click on one opens no menu ("Save image as", "Copy image"), and one
    cannot be dragged out of the page (nor, on a phone, saved by a long press:
    site.css). It stops the casual copy only; the photos carry their copyright
    in their files' details too (components/admin/PhotoGrid). */
export function NoImageSave() {
  useEffect(() => {
    const isImage = (t: EventTarget | null) =>
      t instanceof Element && Boolean(t.closest("img, picture, svg image, .photo-tile, .zoomable, .layout-frame, .layout-card"));
    const stop = (e: Event) => isImage(e.target) && e.preventDefault();
    document.addEventListener("contextmenu", stop);
    document.addEventListener("dragstart", stop);
    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("dragstart", stop);
    };
  }, []);
  return null;
}
