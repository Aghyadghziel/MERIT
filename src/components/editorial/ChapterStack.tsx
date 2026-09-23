'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { reduced, setupGsap } from '@/lib/gsap';

/** Where the chapters pin. The same condition as the CSS that makes them sticky. */
const PINNED = '(min-width: 1024px) and (min-height: 640px)';

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

    mm.add(PINNED, () => {
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

  /**
   * Keyboard focus never lands on a page that is covered. Tabbing back out of
   * a chapter moves focus into the one underneath it, which is still pinned
   * under its successor, and the browser sees nothing to scroll. So when focus
   * enters a chapter that is not lying open — covered by the next, or not yet
   * risen to the top — the book is turned back (or on) to the point where that
   * chapter is whole and flat. Applies with reduced motion too: the pinning is
   * CSS and happens either way.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pinned = window.matchMedia(PINNED);

    const onFocus = (e: FocusEvent) => {
      if (!pinned.matches) return;
      const target = e.target as Element | null;
      // A pointer can only reach what it can see; this is for the keyboard.
      if (!target?.matches(':focus-visible')) return;
      const page = target.closest<HTMLElement>('[data-chapter]');
      if (!page || !el.contains(page)) return;
      const pages = [...el.querySelectorAll<HTMLElement>('[data-chapter]')];
      const next = pages[pages.indexOf(page) + 1];
      const top = page.getBoundingClientRect().top;
      const intruding = next ? next.getBoundingClientRect().top < window.innerHeight - 1 : false;
      if (Math.abs(top) <= 1 && !intruding) return;

      // The chapter's place in the flow, measured without the sticky offset:
      // from the first element after it that is not itself pinned, less its
      // own height; the last chapter, which nothing follows, from the stack.
      let top0: number;
      const after = page.nextElementSibling as HTMLElement | null;
      if (after && !after.hasAttribute('data-chapter')) {
        top0 = after.getBoundingClientRect().top + window.scrollY - page.offsetHeight;
      } else {
        top0 = el.getBoundingClientRect().bottom + window.scrollY - page.offsetHeight;
      }
      window.scrollTo({ top: Math.max(0, Math.round(top0)), behavior: 'instant' });
    };

    el.addEventListener('focusin', onFocus);
    return () => el.removeEventListener('focusin', onFocus);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
