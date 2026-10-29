"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/* An image opened over the page (a photograph in the viewer, a temple's
   layout), made to zoom: the image alone grows inside its own frame, the
   words and the rest of the page stay as they are.
   - The mouse wheel zooms in and out about the pointer.
   - Two tools, chosen in the small bar over the image: the zoom tool (a click
     zooms in there, a shift- or alt-click out) and the move tool (dragging
     moves the zoomed image about). Dragging moves it with either tool.
   - "Fit" (or double-click, or 0) shows it whole again; + and − zoom too.
   Shown whole again for each new image (give it a `key`). */

const MAX = 4;
const STEP = 2;

type Tool = "zoom" | "move";

export function Zoomable({ children, className }: { children: ReactNode; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("zoom");
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);

  // kept within the frame: the zoomed image always covers it
  const within = useCallback((s: number, x: number, y: number) => {
    const el = frame.current;
    if (!el || s <= 1) return { s: 1, x: 0, y: 0 };
    const w = el.clientWidth;
    const h = el.clientHeight;
    return { s, x: Math.min(0, Math.max(w - w * s, x)), y: Math.min(0, Math.max(h - h * s, y)) };
  }, []);

  // zoomed to `s`, the point (px, py) of the frame staying where it is
  const zoomTo = useCallback(
    (s: number, px?: number, py?: number) =>
      setView((v) => {
        const el = frame.current;
        const next = Math.min(MAX, Math.max(1, s));
        const cx = px ?? (el ? el.clientWidth / 2 : 0);
        const cy = py ?? (el ? el.clientHeight / 2 : 0);
        return within(next, cx - ((cx - v.x) * next) / v.s, cy - ((cy - v.y) * next) / v.s);
      }),
    [within]
  );
  const fit = () => setView({ s: 1, x: 0, y: 0 });
  const at = (e: { clientX: number; clientY: number }) => {
    const r = frame.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  // the wheel (held here, so the page and the viewer behind do not scroll)
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const [px, py] = at(e);
      setView((v) => {
        const next = Math.min(MAX, Math.max(1, v.s * Math.exp(-e.deltaY * 0.0025)));
        return within(next, px - ((px - v.x) * next) / v.s, py - ((py - v.y) * next) / v.s);
      });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [within]);

  // + − 0 on the keyboard
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      // only while its pop-up is open
      if (!frame.current?.closest("dialog[open]")) return;
      if (e.key === "+" || e.key === "=") zoomTo(view.s * STEP);
      else if (e.key === "-" || e.key === "_") zoomTo(view.s / STEP);
      else if (e.key === "0") fit();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [view.s, zoomTo]);

  const zoomed = view.s > 1;
  const cursor =
    dragging ? "grabbing" : tool === "move" ? (zoomed ? "grab" : "default") : view.s >= MAX ? "zoom-out" : "zoom-in";

  return (
    <div className={`zoomable${className ? ` ${className}` : ""}`}>
      <div
        ref={frame}
        className="zoomable-frame"
        style={{ cursor, touchAction: zoomed ? "none" : undefined }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.hypot(dx, dy) < 4) return;
          d.moved = true;
          if (!zoomed) return;
          setDragging(true);
          setView((v) => within(v.s, d.vx + dx, d.vy + dy));
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          setDragging(false);
          if (!d || d.moved || tool !== "zoom" || e.pointerType === "touch") return;
          const [px, py] = at(e);
          zoomTo(e.shiftKey || e.altKey || view.s >= MAX ? view.s / STEP : view.s * STEP, px, py);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          if (tool === "move") fit();
        }}
        // a zoomed image's swipes move it, not on to the next one
        onTouchStart={(e) => zoomed && e.stopPropagation()}
        onTouchEnd={(e) => zoomed && e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className="zoomable-content"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, transition: dragging ? "none" : undefined }}
        >
          {children}
        </div>
      </div>
      <div className="zoomable-tools" role="toolbar" aria-label="Zoom" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-pressed={tool === "zoom"} onClick={() => setTool("zoom")} title="Zoom tool: click to zoom in, shift-click to zoom out">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" />
          </svg>
        </button>
        <button type="button" aria-pressed={tool === "move"} onClick={() => setTool("move")} title="Move tool: drag to move the image about">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
          </svg>
        </button>
        <span className="zoomable-sep" />
        <button type="button" onClick={() => zoomTo(view.s / STEP)} disabled={!zoomed} title="Zoom out (−)">
          −
        </button>
        <span className="zoomable-level">{Math.round(view.s * 100)}%</span>
        <button type="button" onClick={() => zoomTo(view.s * STEP)} disabled={view.s >= MAX} title="Zoom in (+)">
          +
        </button>
        <button type="button" className="zoomable-fit" onClick={fit} disabled={!zoomed} title="Show it whole (0)">
          Fit
        </button>
      </div>
    </div>
  );
}
