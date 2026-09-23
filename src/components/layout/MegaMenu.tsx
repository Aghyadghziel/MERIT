'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import { NAV } from '@/lib/nav';

type Props = {
  openLabel: string | null;
  onClose: () => void;
  onEnter: () => void;
  onLeave: () => void;
};

/**
 * The panel is kept mounted through its exit so it can animate out; `shown`
 * lags behind `openLabel` by exactly one transition.
 */
export function MegaMenu({ openLabel, onClose, onEnter, onLeave }: Props) {
  const [shown, setShown] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (openLabel) setShown(openLabel);
  }, [openLabel]);

  useEffect(() => {
    const el = panel.current;
    if (!el || !shown) return;
    const { gsap } = setupGsap();

    if (reduced()) {
      gsap.set(el, { opacity: openLabel ? 1 : 0 });
      if (!openLabel) setShown(null);
      return;
    }

    timeline.current?.kill();
    const cols = el.querySelectorAll<HTMLElement>('[data-col]');
    const feature = el.querySelector<HTMLElement>('[data-feature]');

    if (openLabel) {
      const tl = gsap.timeline();
      tl.fromTo(el, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: DUR.panel, ease: EASE.big })
        .fromTo(cols, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.36, ease: EASE.reveal, stagger: 0.05 }, 0.06)
        .fromTo(
          feature,
          { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.05 },
          { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.6, ease: EASE.big },
          0.04,
        );
      timeline.current = tl;
    } else {
      const tl = gsap.timeline({ onComplete: () => setShown(null) });
      tl.to(el, { opacity: 0, y: -8, duration: 0.2, ease: EASE.ui });
      timeline.current = tl;
    }

    return () => { timeline.current?.kill(); };
  }, [openLabel, shown]);

  const item = NAV.find((n) => n.label === shown);
  if (!item?.menu) return null;
  const { columns, feature, viewAll } = item.menu;

  return (
    <div
      ref={panel}
      id={`menu-${item.label.toLowerCase()}`}
      className="absolute inset-x-0 top-full hidden border-t border-line bg-bone text-ink lg:block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div className="page grid-page py-12">
        {columns.map((col) => (
          <div key={col.title} data-col className="col-span-3">
            <p className="label-sm mb-5 text-mute">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="link-quiet display-sm font-normal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-3">
          <Link href={feature.href} className="group block" data-col>
            <div className="frame frame-4-5" data-feature>
              <Image
                src={`/img/${feature.image}.webp`}
                alt=""
                width={1400}
                height={1750}
                sizes="25vw"
                className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
              />
            </div>
            <p className="label-sm mt-4 text-mute">{feature.kicker}</p>
            <p className="display-sm mt-1.5">{feature.title}</p>
            <span className="label mt-3 inline-flex items-center gap-2">
              {feature.cta}
              <Icon name="arrowR" className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="page flex h-14 items-center">
          <Link href={viewAll.href} className="label inline-flex items-center gap-2 hover:opacity-60">
            {viewAll.label}
            <Icon name="arrowR" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
