'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Lines } from '@/components/ui/Lines';
import { Icon } from '@/components/ui/Icon';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';

type Props = {
  kicker: string;
  title: string;
  sentence: string;
  cta: { label: string; href: string };
  /** Base names in /public/img — the wide crop and the portrait crop. */
  imageWide: string;
  imagePortrait: string;
  alt: string;
};

/**
 * The opening frame. One photograph, four lines of type, and a single scrub
 * that lets the image drift up a little slower than the page. Nothing is
 * pinned and the scroll is never taken over.
 */
export function Hero({ kicker, title, sentence, cta, imageWide, imagePortrait, alt }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap, ScrollTrigger } = setupGsap();

    const ctx = gsap.context(() => {
      const image = el.querySelector('[data-hero-img]');
      const copy = el.querySelectorAll('[data-hero-copy]');

      const intro = gsap.timeline({ delay: 0.12 });
      intro
        .fromTo(
          image,
          { clipPath: 'inset(12% 8% 12% 8%)', scale: 1.14 },
          { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.2, ease: EASE.big },
        )
        .fromTo(copy, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: DUR.reveal, ease: EASE.reveal, stagger: 0.09 }, 0.35);

      // A slow drift, scrubbed — 8% over a whole viewport is enough to feel
      // alive and little enough that it never fights the scroll.
      gsap.to(image, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
      gsap.to(el.querySelector('[data-hero-block]'), {
        opacity: 0,
        y: -24,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: '60% top', scrub: 0.4 },
      });

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-header-over
      className="on-ink relative flex h-[100svh] min-h-[34rem] flex-col justify-end overflow-hidden bg-ink text-bone"
      aria-label={`${kicker} — ${title}`}
    >
      <div data-hero-img className="absolute inset-0 h-[108%] will-change-transform">
        <picture>
          <source media="(min-width: 768px)" srcSet={`/img/${imageWide}.webp`} />
          <img
            src={`/img/${imagePortrait}.webp`}
            alt={alt}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
        {/* Two short scrims instead of one flat overlay, so the middle of the
            photograph is never dimmed. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/62 via-black/18 to-transparent" />
      </div>

      <div data-hero-block className="page relative z-10 pb-12 md:pb-16">
        <div className="max-w-2xl">
          <p data-hero-copy className="label border-l border-bone/45 pl-4">{kicker}</p>
          <h1 data-hero-copy className="display-xl mt-6">
            <Lines text={title} />
          </h1>
          <p data-hero-copy className="body-lg mt-6 max-w-md text-bone/85">{sentence}</p>
          <div data-hero-copy className="mt-9">
            <Link href={cta.href} className="btn btn-solid group">
              {cta.label}
              <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div aria-hidden className="page relative z-10 pb-6 md:pb-8">
        <span className="label-sm flex items-center gap-2 text-bone/60">
          Scroll
          <span className="block h-px w-10 bg-bone/40" />
        </span>
      </div>
    </section>
  );
}
