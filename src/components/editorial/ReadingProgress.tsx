'use client';

import { useEffect, useRef } from 'react';

/**
 * A hairline under the header that fills as the article is read — from the
 * first line of the text to the last, not the length of the page, and from
 * the right in Arabic. It is a
 * position readout rather than an animation, so it runs under reduced motion
 * too; it just never eases.
 */
export function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    const line = bar.current;
    if (!el || !line) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const nav = line.getBoundingClientRect().top;
      const r = el.getBoundingClientRect();
      // 0 when the text's first line meets the header, 1 when its last line
      // reaches the bottom of the screen.
      const span = Math.max(1, r.height - (window.innerHeight - nav));
      const p = Math.min(1, Math.max(0, (nav - r.top) / span));
      line.style.transform = `scaleX(${p})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div
      ref={bar}
      aria-hidden
      // Inline transform, not a scale-x utility: Tailwind's scale classes set
      // the separate `scale` property, which would multiply this to nothing.
      style={{ transform: 'scaleX(0)' }}
      className="pointer-events-none fixed inset-x-0 top-[var(--header-offset,var(--nav-h))] z-40 h-[2px] origin-left rtl:origin-right bg-bone mix-blend-difference transition-[top] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
    />
  );
}
