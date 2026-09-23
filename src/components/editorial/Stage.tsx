'use client';

import { useLayoutEffect, useRef } from 'react';
import { reduced, setupGsap } from '@/lib/gsap';

type Props = React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'header' | 'div' | 'figure';
  /** The section opens the page: layers move from load until it has left. */
  opener?: boolean;
};

/**
 * A section whose pictures move at their own speed while it scrolls. Only
 * picture layers are marked — type and controls never drift, so reading is
 * never chasing a moving line.
 *
 *   data-drift="n"   travels n% of its own height across the scroll
 *   data-zoom="s"    an entering picture settles from scale s to 1; an opener
 *                    pushes back from 1 to s as it leaves
 *   data-dim         a shade that deepens as an opener leaves
 *
 * Reduced motion: nothing is bound, every layer stays where the layout put it.
 */
export function Stage({ as = 'section', opener = false, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const range = () =>
      opener
        ? { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
        : { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true };

    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-drift]').forEach((n) => {
        const d = Number(n.dataset.drift) || 10;
        gsap.fromTo(n, { yPercent: opener ? 0 : -d / 2 }, { yPercent: opener ? d : d / 2, ease: 'none', scrollTrigger: range() });
      });
      el.querySelectorAll<HTMLElement>('[data-zoom]').forEach((n) => {
        const s = Number(n.dataset.zoom) || 1.12;
        gsap.fromTo(n, { scale: opener ? 1 : s }, { scale: opener ? s : 1, ease: 'none', scrollTrigger: range() });
      });
      el.querySelectorAll<HTMLElement>('[data-dim]').forEach((n) => {
        gsap.fromTo(n, { opacity: 0 }, { opacity: 0.55, ease: 'none', scrollTrigger: range() });
      });
    }, el);
    return () => ctx.revert();
  }, [opener]);

  const Tag = as as 'section';
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
