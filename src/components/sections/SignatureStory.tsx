'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Price } from '@/components/commerce/Price';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { SectionHead } from '@/components/ui/SectionHead';
import { EASE, reduced, setupGsap } from '@/lib/gsap';
import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';

type Step = { kicker: string; title: string; body: string };

const STEPS: Step[] = [
  {
    kicker: 'The line',
    title: 'High at the waist, wide from the hip.',
    body: 'The waistband sits on the natural waist and the leg leaves it without a dart, so the trouser reads as one column from rib to floor. Everything else in the collection is proportioned against it.',
  },
  {
    kicker: 'The cloth',
    title: 'Wool and linen, woven in Biella.',
    body: 'Seventy-eight per cent virgin wool against twenty-two per cent linen. The linen keeps the cloth dry and gives it a slight irregularity in the surface; the wool stops it creasing into a map by lunchtime.',
  },
  {
    kicker: 'The waistband',
    title: 'Faced, not lined.',
    body: 'A lined waistband sits proud under a tucked shirt. This one is faced with the same cloth and closed with a hook and bar, which keeps the front flat and removes the button entirely.',
  },
  {
    kicker: 'The hem',
    title: 'Deep enough to hang.',
    body: 'A six-centimetre hem, weighted so the leg falls straight instead of swinging. It breaks once over the shoe and stops there.',
  },
];

/**
 * One product, read like a feature rather than sold like an advertisement. The
 * photographs stay put and change under the text — sticky rather than pinned,
 * so the scroll is never intercepted.
 */
export function SignatureStory({ product, index }: { product: Product; index: number }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const { gsap, ScrollTrigger } = setupGsap();

    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 60%',
          end: 'bottom 60%',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Crossfade whichever photograph the text is talking about.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap } = setupGsap();
    const shots = el.querySelectorAll<HTMLElement>('[data-shot]');
    if (reduced()) {
      shots.forEach((s, i) => gsap.set(s, { opacity: i === active ? 1 : 0 }));
      return;
    }
    shots.forEach((shot, i) =>
      gsap.to(shot, { opacity: i === active ? 1 : 0, duration: 0.55, ease: EASE.ui, overwrite: 'auto' }),
    );
  }, [active]);

  return (
    <section ref={root} className="page section-y" aria-labelledby="signature-title">
      <SectionHead index={index} title="In detail" as="p" />

      <div className="mt-12 grid-page md:mt-16">
        {/* Sticky image column — second in source order on a phone so the
            first thing read is the name of the thing. */}
        <div className="col-span-4 order-2 md:col-span-3 lg:order-1 lg:col-span-6">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <div className="frame frame-4-5 relative">
              {product.images.map((img, i) => (
                <div
                  key={img}
                  data-shot
                  className={cn('absolute inset-0', i === 0 ? 'opacity-100' : 'opacity-0')}
                >
                  <Image
                    src={`/img/${img}.webp`}
                    alt={i === 0 ? `${product.name}, ${product.colours[0].name}` : ''}
                    width={1400}
                    height={1750}
                    sizes="(min-width:1024px) 48vw, 100vw"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2" aria-hidden>
              {product.images.map((img, i) => (
                <span
                  key={img}
                  className={cn('h-px flex-1 transition-colors duration-300', i === active ? 'bg-ink' : 'bg-line')}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 order-1 md:col-span-3 lg:order-2 lg:col-span-5 lg:col-start-8">
          <p className="label text-mute" data-reveal>{product.category} · {product.madeIn}</p>
          <h2 id="signature-title" className="display-lg mt-4">
            <Lines text={product.name} />
          </h2>
          <div className="mt-5 flex items-center gap-5" data-reveal>
            <Price amount={product.price} compareAt={product.compareAt} size="lg" />
            <Link href={`/products/${product.slug}`} className="label link-rule">View the garment</Link>
          </div>

          <div className="mt-10 lg:mt-14">
            {STEPS.map((step, i) => (
              <div
                key={step.kicker}
                data-step
                className={cn(
                  'border-t border-line py-8 transition-opacity duration-500 lg:min-h-[52svh] lg:py-12',
                  active === i ? 'opacity-100' : 'lg:opacity-40',
                )}
              >
                <p className="label-sm text-mute">
                  <span className="nums mr-2.5">{String(i + 1).padStart(2, '0')}</span>
                  {step.kicker}
                </p>
                <h3 className="display-md mt-4">{step.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">{step.body}</p>
              </div>
            ))}
          </div>

          <Link href={`/products/${product.slug}`} className="btn btn-solid group mt-4 w-full sm:w-auto">
            Shop {product.name}
            <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
