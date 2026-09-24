'use client';

import { useEffect, useRef } from 'react';

/**
 * The house cursor, for fine pointers only (a mouse or trackpad; touch keeps
 * the system's behaviour). A 6 px dot rides exactly on the pointer and a
 * 34 px hairline ring follows it on a spring. Both are drawn in
 * `mix-blend-mode: difference`, so they read as ink on the warm white and as
 * warm white on black, photographs included, without knowing what is under
 * them.
 *
 * States, read from the element under the pointer:
 *   links and buttons      the ring opens out and the dot steps back
 *   [data-cursor="Wear"]   the ring fills and carries the word
 *   [data-cursor-busy]     while he dresses: the ring draws itself round as
 *                          the clip plays (--fr-progress), with what is
 *                          happening beside it, instead of a spinning wheel
 *   [data-cursor-hide]     only the dot (the anatomy reveal is the cursor)
 *   text fields            the system caret, nothing drawn
 * With reduced motion the ring snaps to the pointer instead of trailing it.
 */
const RING = 34;
const R = 16;                                  // progress circle radius, in a 34 viewbox
const C = 2 * Math.PI * R;

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const note = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    const p = { x: -100, y: -100 }, r = { x: -100, y: -100 };
    let scale = 1, target = 1, fill = 0, fillTarget = 0, dotScale = 1, dotTarget = 1;
    let shown = false, down = false, raf = 0, text = '', busyText = '';
    let el: Element | null = null;

    const read = () => {
      const t = el as HTMLElement | null;
      const busyHost = document.querySelector<HTMLElement>('[data-cursor-busy]');
      const overBusy = !!(busyHost && t && busyHost.contains(t));
      const hide = !!t?.closest('[data-cursor-hide]');
      const field = !!t?.closest('input, textarea, select, [contenteditable="true"]');
      const labelled = t?.closest<HTMLElement>('[data-cursor]');
      const action = t?.closest('a, button, summary, label, [role="button"], [role="tab"]');
      busyText = overBusy ? busyHost!.dataset.cursorBusy ?? '' : '';
      text = !busyText && labelled?.dataset.cursor ? labelled.dataset.cursor : '';
      if (field) { target = 0; dotTarget = 0; fillTarget = 0; }
      else if (busyText) { target = 1.9; dotTarget = 0.6; fillTarget = 0; }
      else if (hide) { target = 0; dotTarget = 1.25; fillTarget = 0; }
      else if (text) { target = 2.6; dotTarget = 0; fillTarget = 1; }
      else if (action) { target = 1.65; dotTarget = 0.4; fillTarget = 0; }
      else { target = 1; dotTarget = 1; fillTarget = 0; }
      if (down) target *= 0.85;
      if (label.current) label.current.textContent = text;
      if (note.current) note.current.textContent = busyText;
    };

    const tick = () => {
      const k = still ? 1 : 0.2;
      r.x += (p.x - r.x) * k; r.y += (p.y - r.y) * k;
      scale += (target - scale) * (still ? 1 : 0.18);
      fill += (fillTarget - fill) * (still ? 1 : 0.2);
      dotScale += (dotTarget - dotScale) * (still ? 1 : 0.3);
      if (dot.current) dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ring.current.style.setProperty('--fill', fill.toFixed(3));
        ring.current.dataset.busy = busyText ? '1' : '';
      }
      if (solid.current) {
        solid.current.style.transform = ring.current!.style.transform;
        solid.current.style.setProperty('--fill', fill.toFixed(3));
      }
      if (arc.current) {
        const v = busyText ? Number(getComputedStyle(root).getPropertyValue('--fr-progress') || 0) : 0;
        arc.current.style.strokeDashoffset = String(C * (1 - v));
      }
      raf = requestAnimationFrame(tick);
    };

    const show = (v: boolean) => {
      if (shown === v) return; shown = v;
      root.classList.toggle('cursor-in', v);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      p.x = e.clientX; p.y = e.clientY;
      if (!shown) { r.x = p.x; r.y = p.y; }
      show(true);
      el = e.target as Element;
      read();
    };
    const over = (e: PointerEvent) => { el = e.target as Element; read(); };
    const leave = (e: PointerEvent) => { if (!e.relatedTarget) show(false); };
    const press = () => { down = true; read(); };
    const release = () => { down = false; read(); };
    // the busy state changes without the pointer moving: keep it current
    const mo = new MutationObserver(() => read());
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-cursor-busy', 'data-cursor', 'disabled', 'aria-disabled'] });

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); mo.disconnect();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', leave);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      root.classList.remove('has-cursor', 'cursor-in');
    };
  }, []);

  return (
    <>
    {/* the labelled disc: solid ink and cream, never blended, so it stays on palette */}
    <div aria-hidden className="house-cursor pointer-events-none fixed inset-0 z-[301]">
      <div ref={solid} className="absolute left-0 top-0 flex items-center justify-center" style={{ width: RING, height: RING }}>
        <span className="house-cursor-disc absolute inset-0 rounded-full" />
        <span ref={label} className="house-cursor-label relative whitespace-nowrap" />
      </div>
    </div>
    <div aria-hidden className="house-cursor pointer-events-none fixed inset-0 z-[300] mix-blend-difference">
      <div ref={ring} className="house-cursor-ring absolute left-0 top-0 flex items-center justify-center"
        style={{ width: RING, height: RING }}>
        <svg className="absolute inset-0 h-full w-full -rotate-90 overflow-visible" viewBox="0 0 34 34">
          <circle className="house-cursor-track" cx="17" cy="17" r={R} fill="none" strokeWidth="1" />
          <circle ref={arc} className="house-cursor-arc" cx="17" cy="17" r={R} fill="none" strokeWidth="1.6"
            strokeDasharray={C} strokeDashoffset={C} strokeLinecap="round" />
        </svg>
        <span ref={note} className="house-cursor-note absolute start-full top-1/2 ms-3 -translate-y-1/2 whitespace-nowrap" />
      </div>
      <div ref={dot} className="house-cursor-dot absolute left-0 top-0 h-1.5 w-1.5 rounded-full" />
    </div>
    </>
  );
}
