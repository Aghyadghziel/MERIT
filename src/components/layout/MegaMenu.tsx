'use client';

import Image from 'next/image';
import Link from '@/i18n/link';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';
import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';
import { countOf, type MenuLink, type NavItem } from '@/lib/nav';

type Props = {
  item: NavItem & { menu: NonNullable<NavItem['menu']> };
  id: string;
  open: boolean;
  /** Another menu was open a moment ago: swap the contents, keep the panel. */
  switching: boolean;
  /** Another menu is taking over from this one: vanish, do not animate out. */
  handoff: boolean;
  onClose: (refocus?: boolean) => void;
};

/** "03 pieces", "01 piece", or the entry's own meta (a season, a kicker). */
function caption(l: MenuLink, fallback: string, locale: Locale) {
  if (!l.meta) return fallback;
  if (!/^\d+$/.test(l.meta)) return l.meta;
  return countOf(Number(l.meta), locale, ['piece', 'pieces'], ['قطعة واحدة', 'قطعتان', 'قطع', 'قطعة'], () => l.meta as string);
}

const SHUT = 'inset(0% 0% 100% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';

/**
 * One panel per top-level item, rendered right after its link so the tab
 * order runs link → menu → next link. It hangs from the header, full width:
 * a poster-size list on the left, two quiet columns, and a picture well on
 * the right that shows whatever you are pointing at.
 *
 * The panel is sized by the viewport, not by the picture: the well takes what
 * the screen can spare (so the whole panel, its "View all" bar included, fits
 * on a 1366 × 650 laptop), and the poster list is set at whatever size lets
 * its entries fill the same height, so the left of the panel is never a hole.
 * If a screen is shorter still, the panel scrolls rather than running off it.
 *
 * The panel is `hidden` until first opened, so none of its photographs load
 * with the page; the well's other pictures are fetched once it has been open
 * for a moment, so they are ready by the time the pointer reaches them.
 */
export function MegaMenu({ item, id, open, switching, handoff, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<MenuLink | null>(null);
  const [warm, setWarm] = useState(false);
  const locale = useLocale();
  const { primary, columns, feature, viewAll, note } = item.menu;
  const md = primary.size === 'md';
  const n = primary.links.length;

  // The height the list may fill: the well (see WELL) plus its caption, less
  // the list's own label. Solved for the type size, so eight categories and
  // four collections both end on the well's caption line.
  // --mm-e is what each story adds under its title: two lines of standfirst
  // where the screen is tall enough, nothing but the gap where it is not.
  const room = 'max(15.25rem, min(100dvh - var(--nav-h) - 14.75rem, 27.25rem))';
  const listSize = md
    ? `clamp(1.375rem, min(2.7vw, calc((${room} - ${n} * var(--mm-e)) / ${(n * 1.2).toFixed(2)})), 2.75rem)`
    : `clamp(1.75rem, min(5.2vw, calc(${room} / ${(n * 1.14).toFixed(2)})), 5.5rem)`;

  // Every picture the well can show, feature first, each once.
  const images = useMemo(() => {
    const all = [feature.image, ...primary.links.map((l) => l.image), ...columns.flatMap((c) => c.links.map((l) => l.image))];
    return [...new Set(all.filter((x): x is string => Boolean(x)))];
  }, [feature.image, primary.links, columns]);

  const shown = preview?.image ?? feature.image;

  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    const { gsap } = setupGsap();
    const lines = el.querySelectorAll('[data-mm-line]');
    const items = el.querySelectorAll('[data-mm-item]');
    const well = el.querySelector('[data-mm-well]');

    if (open) {
      el.hidden = false;
      if (reduced()) {
        gsap.set(el, { clipPath: 'none' });
        return;
      }
      const tl = gsap.timeline();
      if (switching) {
        gsap.set(el, { clipPath: OPEN });
      } else {
        tl.fromTo(el, { clipPath: SHUT }, { clipPath: OPEN, duration: 0.75, ease: 'expo.out' }, 0);
      }
      const at = switching ? 0 : 0.08;
      tl.fromTo(lines, { yPercent: 108 }, { yPercent: 0, duration: 0.85, ease: 'expo.out', stagger: 0.04 }, at)
        .fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.018 }, at + 0.12)
        .fromTo(well, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: OPEN, duration: 1, ease: 'expo.out' }, at);
      return () => { tl.kill(); };
    }

    if (el.hidden) return;
    if (handoff || reduced()) {
      el.hidden = true;
      return;
    }
    const out = gsap.to(el, {
      clipPath: SHUT,
      duration: 0.42,
      ease: 'power3.inOut',
      onComplete: () => { el.hidden = true; },
    });
    return () => { out.kill(); };
  }, [open, switching, handoff]);

  // Fetch the rest of the well once the menu has been open for a beat.
  useEffect(() => {
    if (!open || warm) return;
    const t = window.setTimeout(() => setWarm(true), 380);
    return () => window.clearTimeout(t);
  }, [open, warm]);

  const point = (l: MenuLink) => () => { if (l.image) setPreview(l); };

  return (
    <div
      ref={panel}
      id={id}
      hidden
      className="absolute inset-x-0 top-[calc(100%+1px)] z-10 hidden max-h-[calc(100dvh_-_var(--nav-h)_-_1px)] overflow-y-auto border-b border-line bg-bone text-ink lg:block"
      onMouseLeave={() => setPreview(null)}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(true); } }}
      // Choosing anything closes the menu at once; the route line at the top
      // carries the wait if the next page takes a moment.
      onClick={(e) => { if ((e.target as Element).closest('a[href]')) onClose(); }}
    >
      <div className="page grid-page pb-10 pt-9 xl:pb-12 xl:pt-11">
        {/* The poster list */}
        <div className={md ? 'col-span-6' : 'col-span-5'}>
          <p className="label-sm flex items-center gap-3 text-mute" data-mm-item>
            <span>{primary.title}</span>
            <span aria-hidden className="h-px w-8 bg-line-2" />
            <span className="nums">{String(primary.links.length).padStart(2, '0')}</span>
          </p>
          <ul
            className={cn('group/list mt-6 xl:mt-7', md && '[--mm-e:3.5rem] [@media(max-height:799px)]:[--mm-e:1rem]')}
            style={{ fontSize: listSize }}
          >
            {primary.links.map((l) => (
              // A flex column, so the line box is the link's own and not a
              // strut at the list's poster size and the body's 1.55 leading.
              <li key={l.href} className={cn('flex flex-col items-start', md && 'pb-4')}>
                <Link
                  href={l.href}
                  onMouseEnter={point(l)}
                  onFocus={point(l)}
                  className={cn(
                    'group/l inline-flex items-start gap-3 py-[0.07em] font-semibold transition-[color,translate] duration-500 ease-(--ease-expo)',
                    'group-hover/list:text-stone hover:translate-x-2 rtl:hover:-translate-x-2 hover:text-ink! focus-visible:text-ink!',
                    md ? 'leading-[1.02] tracking-[-0.04em]' : 'leading-[0.96] tracking-[-0.05em]',
                  )}
                >
                  <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                    <span data-mm-line className="block">{l.label}</span>
                  </span>
                  {l.meta ? (
                    <span data-mm-item className="label-sm nums mt-[0.55em] whitespace-nowrap font-semibold text-mute tracking-[0.12em]">
                      <span className="sr-only">, </span>
                      {l.meta}
                    </span>
                  ) : null}
                </Link>
                {l.note ? (
                  <p data-mm-item className="mt-1 line-clamp-2 max-w-[60ch] text-[0.8125rem] leading-[1.4] text-mute [@media(max-height:799px)]:hidden">
                    {l.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {/* Quiet columns */}
        <div className={cn('grid content-start gap-(--gutter)', md ? 'col-span-3 grid-cols-1' : 'col-span-4 grid-cols-2')}>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="label-sm text-mute" data-mm-item>{col.title}</p>
              <ul className="mt-6 space-y-2.5 xl:mt-7">
                {col.links.map((l) => (
                  <li key={l.href + l.label} data-mm-item>
                    <Link
                      href={l.href}
                      onMouseEnter={point(l)}
                      onFocus={point(l)}
                      className="link-quiet text-[0.9375rem] leading-snug"
                    >
                      {l.label}
                      {l.meta ? (
                        <span className="label-sm nums ms-2 text-mute">
                          <span className="sr-only">, </span>
                          {l.meta}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* The well */}
        <div className="col-span-3">
          <Link href={preview?.href ?? feature.href} className="group block" tabIndex={-1} aria-hidden>
            {/* WELL: as tall as the screen can spare, never taller than a
                4:5 picture at this width. object-fit does the cropping. */}
            <div data-mm-well className="frame h-[clamp(12rem,calc(100dvh_-_var(--nav-h)_-_18rem),24rem)] w-full">
              {images.map((img) => (img === feature.image || warm || img === shown ? (
                <Image
                  key={img}
                  src={`/img/${img}.webp`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 24vw, 1px"
                  className={cn(
                    'object-cover transition-[opacity,scale] duration-700 ease-(--ease-expo)',
                    img === shown ? 'scale-100 opacity-100' : 'scale-[1.06] opacity-0',
                  )}
                />
              ) : null))}
            </div>
          </Link>
          <div className="mt-4 min-h-[4.75rem]" data-mm-item>
            {preview ? (
              <>
                <p className="label-sm text-mute">{caption(preview, item.label, locale)}</p>
                <p className="display-sm mt-1.5 font-semibold">{preview.label}</p>
              </>
            ) : (
              <Link href={feature.href} className="group block">
                <p className="label-sm text-mute">{feature.kicker}</p>
                <p className="display-sm mt-1.5 font-semibold">{feature.title}</p>
                <span className="label mt-2.5 inline-flex items-center gap-2">
                  {feature.cta}
                  <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-500 ease-(--ease-expo) group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="page flex h-14 items-center justify-between gap-6">
          <Link href={viewAll.href} className="label link-arrow" data-mm-item>
            {viewAll.label}
            <Icon name="arrowR" className="h-3.5 w-3.5" />
          </Link>
          <p className="label-sm nums text-mute" data-mm-item>{note}</p>
        </div>
      </div>
    </div>
  );
}
