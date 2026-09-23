'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel } from '@/components/overlays/Panel';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { cn } from '@/lib/cn';
import { EASE, reduced, setupGsap } from '@/lib/gsap';
import { NAV } from '@/lib/nav';
import { pad2 } from '@/lib/format';

/**
 * The phone menu is a room of its own: the whole screen, the index set at
 * poster size, the logotype standing at the foot in stone the way it stands
 * behind the model on the home page.
 *
 * Sub-menus are a second layer that slides over the first rather than a
 * stack of accordions, so you always know which way is back. The top bar
 * mirrors the header exactly, and the menu glyph turns into the close cross
 * in place.
 */
export function MobileNav() {
  const { overlay, close, open } = useUi();
  const { wishlist, count, ready } = useStore();
  const pathname = usePathname();
  const isOpen = overlay === 'menu';
  const [layer, setLayer] = useState<string | null>(null);
  const sub = useRef<HTMLDivElement>(null);
  const opener = useRef<string | null>(null);

  // Back to the top level once the menu has finished closing.
  const reset = useCallback(() => { setLayer(null); opener.current = null; }, []);

  // The menu only exists below 1024px. A tablet turned to landscape (or a
  // window widened) while it is open must not leave an invisible, page-wide
  // layer holding the pointer and the scroll lock: close it as the width
  // crosses over.
  useEffect(() => {
    if (!isOpen) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    if (mq.matches) { close(); return; }
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) close(); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [isOpen, close]);

  // Search and the bag replace the menu. Focus is first handed to the
  // header's own control for that overlay, so that is what the overlay
  // records as its opener and returns to when it closes; the menu's copy is
  // gone by then, and focus would otherwise fall to the top of the page.
  const handOff = (to: 'search' | 'cart') => {
    const target = [...document.querySelectorAll<HTMLElement>(`header [data-opener="${to}"]`)].find(
      (el) => el.getClientRects().length > 0,
    );
    target?.focus({ preventScroll: true });
    open(to);
  };

  useEffect(() => {
    const el = sub.current;
    if (!el) return;
    const { gsap } = setupGsap();
    const items = el.querySelectorAll('[data-sub-item]');
    const lines = el.querySelectorAll('[data-sub-line]');
    // x is pinned to 0 throughout: GSAP reads the inline starting transform as
    // a pixel offset, and only xPercent should move the layer.
    if (reduced()) {
      gsap.set(el, { x: 0, xPercent: layer ? 0 : 100 });
    } else if (layer) {
      const tl = gsap.timeline();
      tl.fromTo(el, { x: 0, xPercent: 100 }, { x: 0, xPercent: 0, duration: 0.7, ease: EASE.cut })
        .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: EASE.cut, stagger: 0.04 }, 0.12)
        .fromTo(items, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE.reveal, stagger: 0.03 }, 0.2);
      return () => { tl.kill(); };
    } else {
      const t = gsap.to(el, { x: 0, xPercent: 100, duration: 0.45, ease: 'power3.inOut' });
      return () => { t.kill(); };
    }
  }, [layer]);

  // Focus follows the layer: into the sub-menu's back button, and home again
  // to the item that opened it.
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      if (layer) sub.current?.querySelector<HTMLElement>('[data-back]')?.focus({ preventScroll: true });
      else if (opener.current) document.querySelector<HTMLElement>(`[data-layer="${opener.current}"]`)?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(t);
  }, [layer, isOpen]);

  const item = NAV.find((n) => n.label === layer);
  const saved = ready ? wishlist.length : 0;
  const inBag = ready ? count : 0;

  return (
    <Panel open={isOpen} onClose={close} onClosed={reset} label="Menu" from="full" className="lg:hidden" rootClassName="lg:hidden">
      {/* The top bar: the header, again, with the glyph turned to a cross.
          Same four places as the header's, so nothing jumps as it opens. */}
      <div className="page grid h-(--nav-h) shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line md:gap-6">
        <div className="-ml-3 flex items-center justify-self-start">
          <button type="button" className={cn(TAP, 'inline-flex')} onClick={close} aria-label="Close menu">
            <Burger crossed={isOpen} />
          </button>
          <button type="button" className={cn(TAP, 'inline-flex')} onClick={() => handOff('search')} aria-label="Search">
            <Icon name="search" />
          </button>
        </div>
        <Link href="/" onClick={close} aria-label="MERIT, home" className="flex h-11 items-center">
          <Wordmark className="h-[22px] w-auto md:h-7" />
        </Link>
        <div className="flex items-center justify-end">
          <Link href="/account" onClick={close} className={cn(TAP, 'hidden sm:inline-flex')} aria-label="Account">
            <Icon name="account" />
          </Link>
          <Link href="/wishlist" onClick={close} className={cn(TAP, 'inline-flex max-[359px]:hidden')} aria-label={`Wishlist, ${saved} saved`}>
            <Icon name="heart" filled={saved > 0} />
          </Link>
          <button
            type="button"
            className="label nums flex min-h-11 shrink-0 items-center gap-2 pl-2"
            onClick={() => handOff('cart')}
            aria-label={`Shopping bag, ${inBag} ${inBag === 1 ? 'item' : 'items'}`}
          >
            <span className="hidden sm:inline">Bag</span>
            <Icon name="bag" className="h-[18px] w-[18px] sm:hidden" />
            <span className={cn('inline-flex h-5 min-w-5 items-center justify-center px-1 text-[0.625rem] leading-none', inBag > 0 ? 'bg-ink text-bone' : 'border border-current/35')}>
              {inBag}
            </span>
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Level one */}
        <div className="no-bar flex h-full flex-col overflow-y-auto" inert={Boolean(layer)}>
          <div className="page flex items-center justify-between pb-2 pt-5" data-panel-item>
            <p className="label-sm text-mute">Index</p>
            <p className="label-sm text-mute">Autumn Winter 2026</p>
          </div>

          <nav aria-label="Menu" className="page">
            <ul>
              {NAV.map((n, i) => {
                const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
                const inner = (
                  <>
                    <span
                      className={cn('label-sm nums flex w-7 shrink-0 flex-col gap-1.5 self-start pt-[0.55em]', active ? 'text-ink' : 'text-mute')}
                      data-panel-item
                    >
                      {pad2(i + 1)}
                      {active ? <span aria-hidden className="block h-px w-4 bg-ink" /> : null}
                    </span>
                    <span className="block flex-1 overflow-hidden pb-[0.06em]">
                      <span data-panel-line className="block">
                        {n.label}
                        {active && n.menu ? <span className="sr-only"> (current section)</span> : null}
                      </span>
                    </span>
                    {n.menu ? <Icon name="arrowR" className="h-5 w-5 shrink-0 text-mute" /> : null}
                  </>
                );
                const row = 'flex min-h-[3.75rem] w-full items-center gap-3 py-2 text-left text-[clamp(2.25rem,1.1rem+6.2vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em]';
                return (
                  <li key={n.label} className="border-b border-line">
                    {n.menu ? (
                      <button
                        type="button"
                        data-layer={n.label}
                        className={row}
                        onClick={() => { opener.current = n.label; setLayer(n.label); }}
                        aria-expanded={layer === n.label}
                        aria-controls="menu-layer"
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link href={n.href} onClick={close} className={row} aria-current={active ? 'page' : undefined}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <ul className="page mt-6 grid grid-cols-2 gap-x-(--gutter)" data-panel-item>
            <li>
              <Link href="/account" onClick={close} className="label flex min-h-12 items-center gap-3 border-b border-line">
                <Icon name="account" className="h-4 w-4" /> Account
              </Link>
            </li>
            <li>
              <Link href="/wishlist" onClick={close} className="label flex min-h-12 items-center gap-3 border-b border-line">
                <Icon name="heart" className="h-4 w-4" filled={saved > 0} /> Wishlist
                {saved ? <span className="nums text-mute">{pad2(saved)}</span> : null}
              </Link>
            </li>
            <li>
              <Link href="/stores" onClick={close} className="label flex min-h-12 items-center gap-3 border-b border-line">
                <Icon name="pin" className="h-4 w-4" /> Stores
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={close} className="label flex min-h-12 items-center gap-3 border-b border-line">
                <Icon name="mail" className="h-4 w-4" /> Contact
              </Link>
            </li>
          </ul>

          <div className="page grid grid-cols-2 gap-x-(--gutter)" data-panel-item>
            <div className="border-b border-line [&_label]:w-full [&_select]:w-full [&_select]:min-h-12">
              <CurrencySelect id="currency-mobile" />
            </div>
            <label className="relative flex items-center border-b border-line">
              <span className="sr-only">Language</span>
              <select className="label select-quiet min-h-12 w-full" defaultValue="en">
                <option value="en">English</option>
                <option value="ar" disabled>العربية — in preparation</option>
              </select>
              <Icon name="chevD" className="pointer-events-none absolute right-0 h-3.5 w-3.5" />
            </label>
          </div>

          {/* The signature, cropped by the bottom of the screen. */}
          <div aria-hidden className="mt-auto overflow-hidden px-(--gutter) pt-10">
            <div className="overflow-hidden">
              <div data-panel-line className="text-stone-brand">
                <Wordmark className="block h-auto w-full translate-y-[12%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Level two */}
        <div
          ref={sub}
          id="menu-layer"
          className="absolute inset-0 bg-bone"
          // An inline transform, not a translate utility: Tailwind's translate
          // is its own CSS property and would stack with the one GSAP drives.
          style={{ transform: 'translateX(100%)' }}
          aria-hidden={!layer}
          inert={!layer}
        >
          {item?.menu ? (
            <div data-sub-scroll className="no-bar h-full overflow-y-auto pb-10">
              {/* Back stays pinned while the layer scrolls: the way out is
                  never more than one tap away. */}
              <div className="sticky top-0 z-10 bg-bone">
              <div className="page flex items-center justify-between border-b border-line">
                <button
                  type="button"
                  data-back
                  onClick={() => setLayer(null)}
                  className="label -ml-1 flex min-h-12 items-center gap-2.5 pr-4"
                >
                  <Icon name="arrowL" className="h-4 w-4" /> Back
                </button>
                <Link href={item.href} onClick={close} className="label link-arrow min-h-12 text-mute">
                  All {item.label.toLowerCase()}
                  <Icon name="arrowR" className="h-3.5 w-3.5" />
                </Link>
              </div>
              </div>

              <div className="page pt-6">
                <p className="label-sm text-mute" data-sub-item>{item.label} · {item.menu.primary.title}</p>
                <ul className="mt-3">
                  {item.menu.primary.links.map((l) => (
                    <li key={l.href} className="border-b border-line">
                      <Link
                        href={l.href}
                        onClick={close}
                        className={cn(
                          'flex min-h-14 items-center gap-3 py-2.5 font-semibold tracking-[-0.045em]',
                          item.menu?.primary.size === 'md'
                            ? 'text-[clamp(1.375rem,1rem+2.4vw,2rem)] leading-[1.05]'
                            : 'text-[clamp(1.75rem,1rem+4vw,2.75rem)] leading-[0.98]',
                        )}
                      >
                        {l.image ? (
                          <span className="relative block aspect-[4/5] w-10 shrink-0 overflow-hidden bg-bone-2" data-sub-item>
                            <Image src={`/img/${l.image}.webp`} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                        ) : null}
                        <span className="block flex-1 overflow-hidden pb-[0.06em]">
                          <span data-sub-line className="block">{l.label}</span>
                        </span>
                        {l.meta ? <span className="label-sm nums shrink-0 text-mute" data-sub-item>{l.meta}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="page mt-9 grid grid-cols-2 gap-x-(--gutter) gap-y-9">
                {item.menu.columns.map((col) => (
                  <div key={col.title} data-sub-item>
                    <p className="label-sm text-mute">{col.title}</p>
                    <ul className="mt-3">
                      {col.links.map((l) => (
                        <li key={l.href + l.label}>
                          <Link href={l.href} onClick={close} className="flex min-h-11 items-center text-[0.9375rem] leading-snug">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Link href={item.menu.feature.href} onClick={close} className="page group mt-10 block" data-sub-item>
                <div className="frame frame-4-5">
                  <Image src={`/img/${item.menu.feature.image}.webp`} alt="" width={900} height={1125} sizes="100vw" />
                </div>
                <p className="label-sm mt-4 text-mute">{item.menu.feature.kicker}</p>
                <p className="display-md mt-1.5">{item.menu.feature.title}</p>
                <span className="label link-arrow mt-3">
                  {item.menu.feature.cta}
                  <Icon name="arrowR" className="h-3.5 w-3.5" />
                </span>
              </Link>

              <div className="page mt-9" data-sub-item>
                <Link href={item.menu.viewAll.href} onClick={close} className="btn btn-solid w-full">
                  {item.menu.viewAll.label}
                </Link>
                <p className="label-sm nums mt-4 text-center text-mute">{item.menu.note}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

/** The header's 44px tap target (display set per use), repeated so the two bars line up exactly. */
const TAP =
  'h-11 w-11 shrink-0 items-center justify-center transition-opacity duration-(--dur-fast) ease-(--ease-out) hover:opacity-55';

/**
 * The header's two-line menu glyph, drawn so its lines can meet in a cross.
 * The rotation waits for the panel to start moving so you see it happen.
 */
function Burger({ crossed }: { crossed: boolean }) {
  const line = 'absolute left-0.5 right-0.5 h-[1.3px] bg-current transition-transform duration-500 ease-(--ease-expo)';
  return (
    <span aria-hidden className="relative block h-5 w-5">
      <span className={cn(line, 'top-[5.5px] delay-150', crossed && 'translate-y-[3.85px] rotate-45')} />
      <span className={cn(line, 'bottom-[5.5px] delay-150', crossed && '-translate-y-[3.85px] -rotate-45')} />
    </span>
  );
}
