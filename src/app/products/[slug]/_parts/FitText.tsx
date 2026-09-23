'use client';

import { useLayoutEffect, useRef } from 'react';
import { Lines } from '@/components/ui/Lines';
import { cn } from '@/lib/cn';

/**
 * One line of poster type, sized so it runs exactly the width of its box —
 * "Index" and "Foundation" both hit the margins. The server renders it at a
 * fluid fallback size; the measured size lands before it is ever on screen.
 * `max` caps it as a fraction of the viewport width.
 */
export function FitText({
  text, id, className, max = 0.3,
}: { text: string; id?: string; className?: string; max?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    // The measurement below sets a size and reads it straight back. Under
    // reduced motion the global rule turns every property change into a
    // (0.01ms) transition, and a transitioning font-size still reads at its
    // old value, so the fit would come out wrong. Nothing here should animate.
    el.style.transition = 'none';
    let last = -1;
    const fit = (force = false) => {
      const target = box.clientWidth;
      if (!force && target === last) return;
      last = target;
      el.style.fontSize = '100px';
      // An optical indent (a negative margin in em) pulls the first letter's
      // side bearing onto the margin; the fit has to count it, or the last
      // letter stops short of the other margin.
      const natural = el.offsetWidth + (parseFloat(getComputedStyle(el).marginLeft) || 0);
      if (natural <= 0) return;
      const size = Math.min((100 * target * 0.995) / natural, window.innerWidth * max);
      el.style.fontSize = `${size.toFixed(2)}px`;
    };
    fit(true);
    const ro = new ResizeObserver(() => fit());
    ro.observe(box);
    document.fonts?.ready.then(() => fit(true)).catch(() => {});
    return () => ro.disconnect();
  }, [text, max]);

  return (
    <h2 ref={ref} id={id} className={cn('w-max max-w-none whitespace-nowrap', className)}>
      <Lines text={text} />
    </h2>
  );
}
