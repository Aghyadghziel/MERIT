'use client';

import { useLayoutEffect, useRef } from 'react';
import { reduced, setupGsap } from '@/lib/gsap';

/**
 * Four collections as four pages of a book. On a desktop each chapter pins
 * full screen, holds for a beat, and the next one slides over it; the page
 * underneath sinks back and darkens as it is covered. The pinning itself is
 * CSS (sticky), so it holds without a script and under reduced motion; GSAP
 * only adds the depth.
 *
 * Children mark themselves: [data-chapter] on each page, [data-chapter-inner]
 * on what sinks, [data-chapter-shade] on the shade that darkens it.
 */
export function ChapterStack({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const mm = gsap.matchMedia();

    // Same condition as the CSS that makes the chapters sticky.
    mm.add('(min-width: 1024px) and (min-height: 640px)', () => {
      const pages = gsap.utils.toArray<HTMLElement>('[data-chapter]', el);
      pages.forEach((page, i) => {
        const next = pages[i + 1];
        if (!next) return;
        const covered = () => ({ trigger: next, start: 'top bottom', end: 'top top', scrub: true });
        gsap.to(page.querySelector('[data-chapter-inner]'), {
          scale: 0.9, yPercent: -3, ease: 'none', transformOrigin: '50% 0%', scrollTrigger: covered(),
        });
        gsap.fromTo(page.querySelector('[data-chapter-shade]'), { opacity: 0 }, { opacity: 0.7, ease: 'none', scrollTrigger: covered() });
      });
    }, el);

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
