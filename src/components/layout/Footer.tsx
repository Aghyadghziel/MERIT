'use client';

import Link from 'next/link';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { Newsletter } from '@/components/sections/Newsletter';
import { Wordmark } from '@/components/ui/Wordmark';
import { BRAND } from '@/lib/brand';
import { FOOTER } from '@/lib/nav';

export function Footer() {
  return (
    <footer className="on-ink bg-ink text-bone">
      <Newsletter />

      <div className="page grid-page border-t border-line-ink py-14 md:py-16">
        {FOOTER.map((group) => (
          <nav key={group.title} aria-label={group.title} className="col-span-2 md:col-span-3 lg:col-span-3">
            <p className="label-sm mb-4 text-mute-ink">{group.title}</p>
            <ul className="space-y-2">
              {group.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="link-quiet text-sm">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="page grid-page border-t border-line-ink py-10">
        <div className="col-span-4 md:col-span-3 lg:col-span-4">
          <p className="label-sm mb-4 text-mute-ink">Stores</p>
          <address className="space-y-3 text-sm not-italic">
            <span className="block">
              <span className="block">Riyadh — Flagship</span>
              <span className="block text-mute-ink">Al Urubah Road, Al Olaya</span>
            </span>
            <span className="block">
              <span className="block">Jeddah — Atelier</span>
              <span className="block text-mute-ink">Al Rawdah District, by appointment</span>
            </span>
            <Link href="/stores" className="link-rule label-sm inline-block">All stores</Link>
          </address>
        </div>

        <div className="col-span-4 md:col-span-3 lg:col-span-4">
          <p className="label-sm mb-4 text-mute-ink">Follow</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`https://instagram.com/${BRAND.instagram}`} className="link-rule" rel="noreferrer noopener" target="_blank">
                Instagram
              </a>
            </li>
            <li><a href={`mailto:${BRAND.email}`} className="link-rule">{BRAND.email}</a></li>
            <li><span className="text-mute-ink">{BRAND.phone}</span></li>
          </ul>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-4">
          <p className="label-sm mb-4 text-mute-ink">Region</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <CurrencySelect />
            <label className="flex items-center gap-2">
              <span className="sr-only">Language</span>
              <select
                className="label bg-transparent py-1 text-bone [&>option]:text-ink"
                defaultValue="en"
                onChange={(e) => e.preventDefault()}
              >
                <option value="en">English</option>
                <option value="ar" disabled>العربية — in preparation</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="page border-t border-line-ink py-10">
        <Wordmark className="h-10 w-auto opacity-25 md:h-16" />
        <div className="mt-8 flex flex-col gap-3 text-xs text-mute-ink md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.legal}. {BRAND.city}, {BRAND.country}.
          </p>
          <p className="max-w-lg">
            A concept site. {BRAND.name} is not a real company: the garments, prices, stock and
            stores here are invented, and nothing can be bought.
          </p>
        </div>
      </div>
    </footer>
  );
}
