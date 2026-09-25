"use client";

import { useEffect, useState } from "react";
import { tamilDate, todayInIndia, type TamilDate } from "@/lib/tamilDate";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* Today's Tamil date. Worked out in the browser,
   because the page itself is built ahead of time and would otherwise show
   the day it was built. */
export function TodayTamil() {
  const [today, setToday] = useState<{ t: TamilDate; civil: string } | null>(null);

  useEffect(() => {
    const { y, m, d, weekday } = todayInIndia();
    setToday({ t: tamilDate(y, m, d), civil: `${WEEKDAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}` });
  }, []);

  return (
    <aside className="today" aria-label="Today in the Tamil calendar">
      {today && (
        <>
          <div className="kicker">Today</div>
          <p className="today-tamil" lang="ta">
            {today.t.month.ta} {today.t.day}
          </p>
          <p className="today-en">
            {today.t.day} {today.t.month.en}, {today.t.year} year
          </p>
          <p className="caps">{today.civil}</p>
        </>
      )}
    </aside>
  );
}
