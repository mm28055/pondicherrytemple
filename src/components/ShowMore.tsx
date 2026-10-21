"use client";

import { useState, type ReactNode } from "react";

/** A long list, on a phone: the first `shown` of it, and a button for the
    rest ("All 17 field notes ↓"); on a wider screen, all of it. */
export function ShowMore({ shown, label, children }: { shown: number; label: string; children: ReactNode[] }) {
  const [open, setOpen] = useState(false);
  if (children.length <= shown) return <>{children}</>;
  return (
    <>
      {children.slice(0, shown)}
      <div className={open ? "more-rest open" : "more-rest"}>{children.slice(shown)}</div>
      {!open && (
        <button type="button" className="more-button" onClick={() => setOpen(true)}>
          {label} ↓
        </button>
      )}
    </>
  );
}
