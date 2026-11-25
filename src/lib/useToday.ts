"use client";

import { useEffect, useState } from "react";
import { todayISO } from "./tamilDate";

/** Today in India (ISO). The pages are built ahead and kept, some for a day
    and more, so the day they were built (`built`) is only where it starts:
    the visitor's own clock gives the day, on arriving, and again whenever the
    page is come back to. */
export function useToday(built: string): string {
  const [today, setToday] = useState(built);
  useEffect(() => {
    const look = () => setToday(todayISO());
    look();
    document.addEventListener("visibilitychange", look);
    window.addEventListener("pageshow", look);
    return () => {
      document.removeEventListener("visibilitychange", look);
      window.removeEventListener("pageshow", look);
    };
  }, []);
  return today;
}
