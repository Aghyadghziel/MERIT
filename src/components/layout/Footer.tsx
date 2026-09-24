'use client';

import Link from '@/i18n/link';
import { LanguageSwitch } from '@/i18n/LanguageSwitch';
import { useT } from '@/i18n/client';
import { useSyncExternalStore } from 'react';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { Newsletter } from '@/components/sections/Newsletter';
import { Icon } from '@/components/ui/Icon';
import { LiquidLogo } from '@/components/landing/LiquidMark';
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
  const t = useT();
  const time = useSyncExternalStore(subscribeClock, readClock, serverClock);
  return (
    <span className="nums">
      {t(BRAND.city)} <span className="text-bone" dir="ltr">{time || '--:--'}</span> <span className="sr-only">{t('local time')}</span>
    </span>
  );
}


/**
 * The footer opens on the signature: the city and the season on one line, the
 * logotype poured in liquid chrome across the page (LiquidLogo, WebGL, with
 * the drawn logotype as its fallback) and the house line under it. The links,
 * the letter and the small print follow.
 */
export function Footer() {
  const t = useT();
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('header a[data-home]')?.focus({ preventScroll: true });
  };

  return (
    <footer className="on-ink relative bg-ink text-bone">
      <div className="page pb-8 pt-10 md:pb-10 md:pt-12">
        <div className="flex items-center justify-between">
          <p className="label-sm nums text-bone/60">{t('{city} — since {year}', { city: t(BRAND.city), year: BRAND.founded })}</p>
          <p className="label-sm nums text-bone/60">{t('Autumn Winter 2026')}</p>
        </div>
        <LiquidLogo className="mx-auto mt-4 w-full md:mt-6" />
        <p className="mt-4 text-[clamp(1.05rem,0.95rem+0.5vw,1.3rem)] font-semibold leading-tight tracking-[-0.03em] md:mt-6">
          {t(BRAND.line)}
        </p>
      </div>

      <div className="border-t border-line-ink">
        <Newsletter />
      </div>

      <div className="page border-t border-line-ink">
        <div className="grid-page gap-y-10 py-10 md:py-12">
          {FOOTER.map((group) => (
            <nav key={group.title} aria-label={t(group.title)} className="col-span-2 md:col-span-3 lg:col-span-2">
              <p className="label-sm text-mute-ink">{t(group.title)}</p>
              <ul className="mt-4 space-y-0.5">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="link-quiet inline-flex min-h-8 items-center text-[0.9375rem]">
                      {t(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-4 md:col-span-6 lg:col-span-3 lg:col-start-10">
            <p className="label-sm text-mute-ink">{t('Stores')}</p>
            <address className="mt-5 space-y-4 text-[0.9375rem] not-italic leading-snug">
              <span className="block">
                <span className="block">{t('Riyadh — Flagship')}</span>
                <span className="block text-mute-ink">{t('Al Urubah Road, Al Olaya')}</span>
              </span>
              <span className="block">
                <span className="block">{t('Jeddah — Atelier')}</span>
                <span className="block text-mute-ink">{t('Al Rawdah District, by appointment')}</span>
              </span>
            </address>
            <Link href="/stores" className="label link-arrow mt-6 min-h-11">
              {t('All stores')}
              <Icon name="arrowR" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="page border-t border-line-ink">
        <div className="flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[0.9375rem]">
            {/* No social link: MERIT is a concept and owns no account, so a
                handle here would send people to whoever does. */}
            <li>
              <a href={`mailto:${BRAND.email}`} className="link-quiet inline-flex min-h-11 items-center" dir="ltr">{BRAND.email}</a>
            </li>
            <li className="nums text-mute-ink" dir="ltr">{BRAND.phone}</li>
          </ul>

          <div className="grid grid-cols-2 items-center gap-x-(--gutter) gap-y-3 lg:flex lg:gap-x-9">
            <div className="border-b border-line-ink lg:border-0 [&_label]:w-full [&_select]:w-full">
              <CurrencySelect />
            </div>
            <div className="flex items-center border-b border-line-ink lg:border-0">
              <LanguageSwitch />
            </div>
            <button type="button" onClick={toTop} className="label group/top col-span-2 flex min-h-11 items-center gap-2 justify-self-start">
              {t('Back to top')}
              <Icon name="arrowUp" className="h-3.5 w-3.5 transition-transform duration-500 ease-(--ease-expo) group-hover/top:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="page border-t border-line-ink">
        <div className="grid-page gap-y-3 py-5 text-xs leading-relaxed text-mute-ink">
          <p className="col-span-4 md:col-span-3 lg:col-span-4">
            © {new Date().getFullYear()} {BRAND.legal}. {t('{city}, {country}.', { city: t(BRAND.city), country: t(BRAND.country) })}
          </p>
          <p className="col-span-4 max-w-lg md:col-span-3 lg:col-span-5">
            {t('A concept site. {name} is not a real company: the garments, prices, stock and stores here are invented, and nothing can be bought.', { name: BRAND.name })}
          </p>
          <p className="label-sm col-span-4 md:col-span-6 lg:col-span-3 lg:text-end">
            <RiyadhClock />
          </p>
        </div>
      </div>

    </footer>
  );
}
