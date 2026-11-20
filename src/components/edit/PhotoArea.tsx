"use client";

/* Admin2: tells the bar this page has photographs to arrange (editStore),
   for its Photos button and for photos dropped onto the page. Shows nothing. */

import { useEffect } from "react";
import { editStore, type PhotoAreaInfo } from "./editStore";

export function PhotoArea(props: PhotoAreaInfo) {
  const key = JSON.stringify(props);
  useEffect(() => {
    editStore.setPhotos(JSON.parse(key) as PhotoAreaInfo);
    return () => {
      if (JSON.stringify(editStore.get().photos) === key) editStore.setPhotos(null);
    };
  }, [key]);
  return null;
}
