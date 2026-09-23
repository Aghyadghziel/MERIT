'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { Newsletter } from '@/components/sections/Newsletter';
import { Icon } from '@/components/ui/Icon';
import { LiquidFooterMark } from '@/components/landing/LiquidMark';
import { BRAND } from '@/lib/brand';
import { reduced } from '@/lib/gsap';
import { FOOTER } from '@/lib/nav';

// ─── The time in Riyadh, for the foot of the page ──────────────────────────
const riyadhTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Riyadh',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const subscribeClock = (tick: () => void) => {
  const id = window.setInterval(tick, 15000);
  return () => window.clearInterval(id);
};
const readClock = () => riyadhTime.format(new Date());
const serverClock = () => '';

function RiyadhClock() {
  const time = useSyncExternalStore(subscribeClock, readClock, serverClock);
  return (
    <span className="nums">
      {BRAND.city} <span className="text-bone">{time || '--:--'}</span> <span className="sr-only">local time</span>
    </span>
  );
}

/**
 * The footer ends on the signature: the logotype, poured in liquid chrome and
 * running edge to edge, cropped by the bottom of the page (LiquidFooterMark,
 * WebGL, with the drawn logotype as its fallback).
 */
export function Footer() {
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('header a[href="/"]')?.focus({ preventScroll: true });
  };

  return (
    <footer className="on-ink relative bg-ink text-bone">
      <Newsletter />

      <div className="page border-t border-line-ink">
        <div className="grid-page gap-y-12 py-14 md:py-20">
          {FOOTER.map((group) => (
            <nav key={group.title} aria-label={group.title} className="col-span-2 md:col-span-3 lg:col-span-2">
              <p className="label-sm text-mute-ink">{group.title}</p>
              <ul className="mt-5 space-y-1">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="link-quiet inline-flex min-h-8 items-center text-[0.9375rem]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-4 md:col-span-6 lg:col-span-3 lg:col-start-10">
            <p className="label-sm text-mute-ink">Stores</p>
            <address className="mt-5 space-y-4 text-[0.9375rem] not-italic leading-snug">
              <span className="block">
                <span className="block">Riyadh — Flagship</span>
                <span className="block text-mute-ink">Al Urubah Road, Al Olaya</span>
              </span>
              <span className="block">
                <span className="block">Jeddah — Atelier</span>
                <span className="block text-mute-ink">Al Rawdah District, by appointment</span>
              </span>
            </address>
            <Link href="/stores" className="label link-arrow mt-6 min-h-11">
              All stores
              <Icon name="arrowR" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="page border-t border-line-ink">
        <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[0.9375rem]">
            <li>
              <a
                href={`https://instagram.com/${BRAND.instagram}`}
                className="link-quiet inline-flex min-h-11 items-center gap-1.5"
                rel="noreferrer noopener"
                target="_blank"
              >
                Instagram
                <Icon name="diagonal" className="h-3.5 w-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="link-quiet inline-flex min-h-11 items-center">{BRAND.email}</a>
            </li>
            <li className="nums text-mute-ink">{BRAND.phone}</li>
          </ul>

          <div className="grid grid-cols-2 items-center gap-x-(--gutter) gap-y-3 lg:flex lg:gap-x-9">
            <div className="border-b border-line-ink lg:border-0 [&_label]:w-full [&_select]:w-full">
              <CurrencySelect />
            </div>
            <label className="relative flex items-center border-b border-line-ink lg:border-0">
              <span className="sr-only">Language</span>
              <select className="label select-quiet w-full text-bone" defaultValue="en">
                <option value="en">English</option>
                <option value="ar" disabled>العربية — in preparation</option>
              </select>
              <Icon name="chevD" className="pointer-events-none absolute right-0 h-3.5 w-3.5" />
            </label>
            <button type="button" onClick={toTop} className="label group/top col-span-2 flex min-h-11 items-center gap-2 justify-self-start">
              Back to top
              <Icon name="arrowUp" className="h-3.5 w-3.5 transition-transform duration-500 ease-(--ease-expo) group-hover/top:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="page border-t border-line-ink">
        <div className="grid-page gap-y-3 py-7 text-xs leading-relaxed text-mute-ink">
          <p className="col-span-4 md:col-span-3 lg:col-span-4">
            © {new Date().getFullYear()} {BRAND.legal}. {BRAND.city}, {BRAND.country}.
          </p>
          <p className="col-span-4 max-w-lg md:col-span-3 lg:col-span-5">
            A concept site. {BRAND.name} is not a real company: the garments, prices, stock and
            stores here are invented, and nothing can be bought.
          </p>
          <p className="label-sm col-span-4 md:col-span-6 lg:col-span-3 lg:text-right">
            <RiyadhClock />
          </p>
        </div>
      </div>

      {/* The signature: the logotype, edge to edge, cropped by the page end. */}
      <LiquidFooterMark />
    </footer>
  );
}
