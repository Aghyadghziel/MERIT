'use client';

import { useLayoutEffect, useRef } from 'react';
import { reduced, setupGsap } from '@/lib/gsap';

/**
 * Moves its content a few percent against the scroll while its parent is on
 * screen. Give it more height than the parent (negative insets) so the drift
 * never shows an edge. Does nothing with reduced motion.
 */
export function Parallax({
  children, className, amount = 8,
}: { children: React.ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [amount]);

  return (
    <div ref={ref} aria-hidden className={className}>
      {children}
    </div>
  );
}
