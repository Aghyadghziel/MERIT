'use client';

import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Wordmark } from '@/components/ui/Wordmark';
import { BRAND } from '@/lib/brand';
import { reduced, setupGsap } from '@/lib/gsap';
import { cn } from '@/lib/cn';

// WebGL, client only, and only fetched when the logotype is near the viewport.
const LiquidMetal = dynamic(() => import('@paper-design/shaders-react').then((m) => m.LiquidMetal), { ssr: false });

const webgl = () => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/**
 * The logotype, poured. The custom MERIT outlines (public/brand/wordmark-mask.png,
 * transparent, with a small margin for the bevel) run through a liquid metal
 * shader (Paper Shaders, Apache-2.0) in the house's own tones: warm-white light,
 * no colour fringe. The canvas mounts only once the box is close, freezes when
 * it leaves the screen, and falls back to the drawn logotype for reduced motion
 * or no WebGL. The box keeps the mask's 1400 × 423 ratio.
 */
export function LiquidLogo({ className, speed = 0.55 }: { className?: string; speed?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Capabilities are read once on the client; the first paint is the drawn logotype.
    const id = requestAnimationFrame(() => { setGl(webgl()); setStill(reduced()); });
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setNear(true);
      setLive(e.isIntersecting);
    }, { rootMargin: '35% 0px' });
    io.observe(el);
    return () => { cancelAnimationFrame(id); io.disconnect(); };
  }, []);

  return (
    <div ref={box} className={cn('relative aspect-[1400/423]', className)}>
      {gl && near ? (
        <LiquidMetal
          image="/brand/wordmark-mask.png"
          colorBack="#00000000"
          colorTint="#F8F6EF"
          repetition={3}
          softness={0.22}
          distortion={0.09}
          contour={0.5}
          shiftRed={0}
          shiftBlue={0}
          angle={62}
          speed={still || !live ? 0 : speed}
          frame={still ? 4200 : undefined}
          scale={1}
          fit="contain"
          maxPixelCount={2_400_000}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      ) : (
        // The mask carries a 12-unit margin on a 410.6 × 124 box; match it.
        <div className="absolute inset-[9.7%_2.9%]"><Wordmark className="h-full w-full" /></div>
      )}
    </div>
  );
}

/** A black room with the poured logotype at full width, growing in as it arrives. */
export function LiquidMark() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-lm="mark"]', { scale: 0.86, opacity: 0.2 }, {
        scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="on-ink relative overflow-hidden bg-ink text-bone" aria-label={`${BRAND.name}, ${BRAND.city}, since ${BRAND.founded}`}>
      <div className="page flex items-center justify-between pt-10 md:pt-14">
        <p className="label text-bone/60">{BRAND.city} — since {BRAND.founded}</p>
        <p className="label text-bone/60">Autumn Winter 2026</p>
      </div>
      <div data-lm="mark" className="mx-auto w-[min(100%-2*var(--gutter),110rem)] will-change-transform">
        <LiquidLogo />
      </div>
      <div className="page pb-10 md:pb-14">
        <p className="max-w-md text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
          Quiet structure, expressive movement.
        </p>
      </div>
    </section>
  );
}

/**
 * The footer signature, poured: the logotype edge to edge, its lower edge
 * cropped by the end of the page. The mask's own side margin is pulled
 * outside the gutter so the letters, not the canvas, meet the margins.
 */
export function LiquidFooterMark() {
  return (
    <div className="overflow-hidden px-(--gutter) pt-8 md:pt-12" aria-hidden>
      <LiquidLogo speed={0.4} className="-mx-[3.2%] w-[106.4%] translate-y-[12%]" />
    </div>
  );
}
