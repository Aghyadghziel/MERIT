'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { LINE_ROOM } from '@/components/ui/SectionHead';
import { reduced, setupGsap } from '@/lib/gsap';

const ROUTES = [
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'Collections', href: '/collections' },
  { label: 'Stores', href: '/stores' },
];

/**
 * An empty rail. The piece has gone, the hangers stay: the page reads as a
 * count that has finished, which is what a missing page on this site usually
 * is. The number is set at poster size and cropped by the edge of the room,
 * the way the logotype is at the foot of every page.
 */
export default function NotFound() {
  const root = useRef<HTMLElement>(null);
  const { open } = useUi();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-nf="img"]', { scale: 1.14 }, { scale: 1, duration: 2.8, ease: 'expo.out' });
      gsap.from('[data-nf="digit"]', { yPercent: 102, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.2 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-header-over="light"
      aria-labelledby="nf-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-bone-2"
    >
      <div data-nf="img" className="absolute inset-0 -z-20 will-change-transform">
        <Image
          src="/img/manifesto-rail.webp"
          alt=""
          fill
          priority
          // Cover-cropped: on a phone the landscape photograph is about four
          // screens wide, so ask for a file that size or it goes soft.
          sizes="(min-width:768px) 115vw, 390vw"
          className="object-cover object-[64%_0%] [filter:saturate(0.85)_contrast(1.02)] md:object-[60%_20%]"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-bone from-28% via-bone/65 via-48% to-transparent to-66% md:bg-gradient-to-r md:from-bone/95 md:from-0% md:via-bone/55 md:via-40% md:to-transparent md:to-70%"
      />

      <div className="page flex flex-1 flex-col pb-[clamp(2rem,1.5rem+2vw,3.5rem)] pt-[calc(var(--nav-h)+clamp(1.25rem,0.75rem+2vw,2.5rem))]">
        <div className="flex items-baseline justify-between gap-6">
          <p className="label">Error 404</p>
          <p className="label">Not found</p>
        </div>

        <div className="mt-auto max-w-[40rem] pt-[38svh] md:pt-24">
          <p
            aria-hidden
            className="nums -ml-[0.04em] flex overflow-hidden pb-[0.02em] text-[clamp(8.5rem,5rem+14vw,15rem)] font-semibold leading-[0.8] tracking-[-0.07em] md:hidden"
          >
            {['4', '0', '4'].map((d, i) => <span key={i} data-nf="digit" className="block">{d}</span>)}
          </p>
          <h1 id="nf-title" className={`display-lg mt-6 max-w-[13ch] md:mt-0 ${LINE_ROOM}`}>
            <Lines text="This page has been taken down." />
          </h1>
          <p className="body-lg mt-6 max-w-[40ch] text-ink-3">
            Pieces are made in small counts and the pages go with them. The link may have been correct once.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => open('search')} className="btn btn-solid">
              <Icon name="search" className="h-4 w-4" /> Search the collection
            </button>
            <Link href="/new" className="btn">New arrivals</Link>
          </div>

          <nav aria-label="Elsewhere" className="mt-10">
            <ul className="flex flex-wrap gap-x-7 gap-y-1">
              {ROUTES.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="inline-flex min-h-11 items-center"><span className="label link-quiet">{r.label}</span></Link>
                </li>
              ))}
              <li>
                <Link href="/" className="inline-flex min-h-11 items-center"><span className="label link-quiet">Home</span></Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* The number, at the scale of the room, cropped by its floor. */}
      <p
        aria-hidden
        className="nums pointer-events-none absolute bottom-0 right-(--gutter) hidden translate-y-[16%] overflow-hidden text-[clamp(16rem,4rem+26vw,34rem)] font-semibold leading-[0.8] tracking-[-0.07em] md:flex"
      >
        {['4', '0', '4'].map((d, i) => <span key={i} data-nf="digit" className="block">{d}</span>)}
      </p>
    </section>
  );
}
