'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';

/**
 * The one generic reveal system. Three attributes cover almost every section:
 *
 *   data-reveal       fade and lift, staggered across whatever enters together
 *   data-reveal-img   the house image reveal — a mask travelling up, with the
 *                     photograph settling out of a small scale
 *   data-reveal-line  word-masked headline, from <Lines>
 *
 * GSAP runs every tween. What decides *when* is a queue of elements that have
 * not been revealed yet, swept on scroll behind requestAnimationFrame. Two
 * things make that the right choice here rather than ScrollTrigger batches or
 * an IntersectionObserver:
 *
 *  - Listings render their grid after hydration and replace it on every filter
 *    change. A batch built at mount never sees those cards, and they stay at
 *    opacity 0 for good.
 *  - An element can cross the whole viewport between two observation steps —
 *    a flung trackpad, the End key, a restored scroll position. An observer
 *    reports it as "not intersecting" both times and never fires. Comparing
 *    positions instead means anything at or above the fold is simply due.
 *
 * The queue drains as the page is read, so the per-frame cost goes to nothing.
 * ScrollTrigger still drives the work it is actually for: the hero drift, the
 * product story sequence, the carousel entrance and the filter panel.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (reduced()) return;
    const { gsap } = setupGsap();
    const BOUND = 'data-reveal-bound';
    const SELECTOR = '[data-reveal],[data-reveal-img],[data-reveal-line]';

    const ctx = gsap.context(() => {
      const pending = new Set<HTMLElement>();

      const reveal = (el: HTMLElement, index: number) => {
        const delay = Math.min(index, 6) * 0.06;

        if (el.hasAttribute('data-reveal-img')) {
          const inner = el.firstElementChild;
          if (inner) {
            gsap.to(inner, {
              clipPath: 'inset(0% 0% 0% 0%)', scale: 1,
              duration: DUR.image, ease: EASE.big, delay, overwrite: true,
            });
          }
          return;
        }

        if (el.hasAttribute('data-reveal-line')) {
          gsap.to(el.querySelectorAll(':scope > span > span'), {
            y: '0%', duration: 0.78, ease: EASE.big, stagger: 0.045, delay, overwrite: true,
          });
          return;
        }

        gsap.to(el, { opacity: 1, y: 0, duration: DUR.reveal, ease: EASE.reveal, delay, overwrite: true });
      };

      /**
       * `settled` means: stop waiting for a scroll. While the reader is
       * scrolling, the trigger line sits a little above the fold so a section
       * reveals just before it is fully in view. But once the page has stopped
       * moving — after load, after fonts, after the resize — anything with any
       * part on screen is due. Otherwise a paragraph peeking over the fold on
       * first paint stays blank until the reader scrolls, and on a page too
       * short to scroll it stays blank for good.
       */
      const sweep = (settled = false) => {
        if (!pending.size) return;
        const view = window.innerHeight;
        const limit = settled ? view : view * 0.92;
        const due: { el: HTMLElement; top: number }[] = [];
        pending.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < limit) due.push({ el, top: rect.top });
        });
        if (!due.length) return;
        // Stagger in the order they sit on the page, not in DOM order.
        due.sort((a, b) => a.top - b.top);
        due.forEach(({ el }, i) => { pending.delete(el); reveal(el, i); });
      };

      let frame = 0;
      let settledNext = false;
      const schedule = (settled = false) => {
        settledNext = settledNext || settled;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const s = settledNext;
          settledNext = false;
          sweep(s);
        });
      };

      const bind = () => {
        document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
          if (el.hasAttribute(BOUND)) return;
          el.setAttribute(BOUND, '');
          if (!el.hasAttribute('data-reveal-img') && !el.hasAttribute('data-reveal-line')) {
            gsap.set(el, { y: 18 });
          }
          pending.add(el);
        });
        schedule();
      };

      bind();

      // Anything React adds later — a Suspense boundary resolving, a filtered
      // grid, a wishlist read back from storage — is picked up here.
      let debounce = 0;
      const mutations = new MutationObserver(() => {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(bind, 100);
      });
      mutations.observe(document.body, { childList: true, subtree: true });

      const onScroll = () => schedule();
      const onSettled = () => schedule(true);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onSettled);
      // Images decoding below the fold change where everything after them sits.
      window.addEventListener('load', onSettled);
      // Fonts settle after first paint and move everything a few pixels.
      document.fonts?.ready.then(onSettled).catch(() => {});
      const settle = window.setTimeout(onSettled, 900);

      return () => {
        window.clearTimeout(debounce);
        window.clearTimeout(settle);
        if (frame) cancelAnimationFrame(frame);
        mutations.disconnect();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onSettled);
        window.removeEventListener('load', onSettled);
        pending.clear();
      };
    });

    return () => ctx.revert();
  }, [pathname]);

  return null;
}
