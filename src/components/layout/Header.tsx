'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { cn } from '@/lib/cn';
import { reduced, setupGsap } from '@/lib/gsap';
import { NAV, type NavItem } from '@/lib/nav';

type Tone = 'none' | 'light' | 'dark';

/**
 * A 44px square tap target around an 18–20px glyph, with no negative margin.
 * No display class: cn() is a plain join, so each use sets its own.
 */
const TAP =
  'h-11 w-11 shrink-0 items-center justify-center transition-opacity duration-(--dur-fast) ease-(--ease-out) hover:opacity-55';
type MenuState = { current: string | null; previous: string | null; path: string };

const slug = (label: string) => `menu-${label.toLowerCase()}`;

/**
 * Three columns: the menu on the left, the logotype dead centre, the bag on the
 * right. Pages can open under a transparent header by marking their first
 * section data-header-over ("light" keeps black type, anything else turns it
 * warm white over a photograph); it turns solid once that section is passed.
 *
 * An opening section that sets the logotype itself at poster size can add
 * data-header-masthead: the header's own logotype then waits until that
 * section has scrolled away, so the brand is never said twice at once.
 *
 * Past the opening section the header steps out of the way while you read
 * down and returns the moment you scroll up. It never hides while a menu is
 * open or while focus is inside it, and it publishes its state on <html> as
 * data-header, which drives --header-offset for anything sticky.
 */
export function Header() {
  const pathname = usePathname();
  const { count, wishlist, ready } = useStore();
  const { open } = useUi();

  const [tone, setTone] = useState<Tone>('none');
  const [masthead, setMasthead] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [menuState, setMenu] = useState<MenuState>({ current: null, previous: null, path: pathname });
  // A menu belongs to the page it was opened on: navigating closes it without
  // an effect, because a stale state simply no longer applies.
  const menu = menuState.path === pathname ? menuState : { current: null, previous: null, path: pathname };

  const header = useRef<HTMLElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const bagCount = useRef<HTMLSpanElement>(null);
  const lastCount = useRef<number | null>(null);

  const setOpenMenu = useCallback((label: string | null) => {
    const path = window.location.pathname;
    setMenu((m) => {
      const current = m.path === path ? m.current : null;
      return current === label && m.path === path ? m : { current: label, previous: current, path };
    });
  }, []);

  // ─── What the header sits over, and whether it should step aside ────────
  useEffect(() => {
    const over = document.querySelector<HTMLElement>('[data-header-over]');
    let frame = 0;
    let lastY = window.scrollY;
    let travel = 0;
    const navH = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16 || 80;

    const measure = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const nav = navH();
      const end = over ? over.getBoundingClientRect().bottom + y : 0;
      setAtTop(over ? y < end - nav - 8 : y < 4);
      setTone(over ? (over.dataset.headerOver === 'light' ? 'light' : 'dark') : 'none');
      setMasthead(Boolean(over?.hasAttribute('data-header-masthead')));

      const dy = y - lastY;
      lastY = y;
      // Nothing moves while the opening section is still on screen.
      if (y < Math.max(end - nav, nav * 2.5)) {
        travel = 0;
        setHidden(false);
        return;
      }
      // A deliberate move, not a trackpad tremor: 28px down to hide, 10px up
      // to come back — returning should always be the easier of the two.
      travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
      if (travel > 28) setHidden(true);
      else if (travel < -10) setHidden(false);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const tucked = hidden && !menu.current && !focusIn;

  useEffect(() => {
    document.documentElement.dataset.header = tucked ? 'hidden' : 'shown';
  }, [tucked]);
  useEffect(() => () => { delete document.documentElement.dataset.header; }, []);

  // ─── Hover intent ────────────────────────────────────────────────────────
  // Opening waits a breath so a pointer passing over the nav on its way
  // somewhere else does not flash a panel; once one is open, moving between
  // items swaps instantly. Closing has a short grace so a diagonal move from
  // the link into the panel does not drop it.
  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const intend = (item: NavItem) => {
    clearTimers();
    const target = item.menu ? item.label : null;
    if (menu.current || !target) setOpenMenu(target);
    else openTimer.current = window.setTimeout(() => setOpenMenu(target), 90);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };
  useEffect(() => clearTimers, []);

  const closeMenu = (refocus?: boolean) => {
    const label = menu.current;
    setOpenMenu(null);
    if (refocus && label) header.current?.querySelector<HTMLElement>(`[data-toggle="${label}"]`)?.focus();
  };

  // ─── The bag count takes a small breath when something is added ─────────
  useEffect(() => {
    if (!ready) return;
    const el = bagCount.current;
    if (el && lastCount.current !== null && count > lastCount.current && !reduced()) {
      const { gsap } = setupGsap();
      gsap.fromTo(el, { scale: 1.45 }, { scale: 1, duration: 0.7, ease: 'expo.out' });
    }
    lastCount.current = count;
  }, [count, ready]);

  const clear = atTop && !menu.current;
  const dark = clear && tone === 'dark';

  return (
    <>
      <Suspense fallback={null}>
        <RouteLine />
      </Suspense>

      <header
        ref={header}
        data-state={tucked ? 'hidden' : clear ? 'clear' : 'solid'}
        className={cn(
          // `translate`, not `transform`: Tailwind v4's translate utilities
          // write the separate translate property, and a transition that
          // does not name it turns the tuck into a jump cut.
          'fixed inset-x-0 top-0 z-50 border-b transition-[translate,background-color,color,border-color,backdrop-filter] duration-[560ms] ease-(--ease-expo)',
          tucked && '-translate-y-full',
          dark && 'on-ink border-transparent text-bone',
          clear && !dark && 'border-transparent text-ink',
          !clear && 'border-line text-ink',
          !clear && (menu.current ? 'bg-bone' : 'bg-bone/88 backdrop-blur-xl backdrop-saturate-150'),
        )}
        onMouseLeave={scheduleClose}
        // Only keyboard focus pins the header in place: a clicked link keeps
        // focus after navigating, and that must not stop it tucking away.
        onFocus={(e) => setFocusIn((e.target as HTMLElement).matches(':focus-visible'))}
        onBlur={(e) => {
          if (header.current?.contains(e.relatedTarget as Node | null)) return;
          setFocusIn(false);
          setOpenMenu(null);
        }}
        onKeyDown={(e) => { if (e.key === 'Escape' && menu.current) closeMenu(true); }}
      >
        {/* A short scrim only where the header sits, so white type stays legible
            over a light photograph without dimming the whole image. */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-black/45 to-transparent transition-opacity duration-500',
            dark ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div className="page grid h-(--nav-h) grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6">
          {/* Phones and tablets: the menu and search on the left, the wishlist
              and bag on the right, two a side. Every target is a full 44px
              square and none overlaps its neighbour; the row is pulled out
              by the glyph's inset so the menu glyph sits on the margin. */}
          <div className="col-start-1 row-start-1 -ml-3 flex items-center justify-self-start lg:hidden">
            <button
              type="button"
              data-opener="menu"
              className={cn(TAP, 'inline-flex')}
              onClick={() => open('menu')}
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <button type="button" data-opener="search" className={cn(TAP, 'inline-flex')} onClick={() => open('search')} aria-label="Search" aria-haspopup="dialog">
              <Icon name="search" />
            </button>
          </div>

          <nav aria-label="Primary" className="col-start-1 row-start-1 hidden self-stretch lg:block">
            <ul className="flex h-full items-stretch gap-5 xl:gap-7">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const isOpen = menu.current === item.label;
                return (
                  <li
                    key={item.label}
                    className="flex items-center"
                    onMouseEnter={() => intend(item)}
                    onBlur={(e) => {
                      if (!isOpen || e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                      setOpenMenu(null);
                    }}
                  >
                    <span className="relative flex h-full items-center">
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className="label group/nav relative flex h-full items-center"
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' && item.menu) {
                            e.preventDefault();
                            setOpenMenu(item.label);
                            requestAnimationFrame(() =>
                              document.getElementById(slug(item.label))?.querySelector<HTMLElement>('a[href]')?.focus(),
                            );
                          }
                        }}
                      >
                        <Roll text={item.label} />
                        <span
                          aria-hidden
                          className={cn(
                            'absolute inset-x-0 -bottom-px h-px origin-left bg-current transition-transform duration-500 ease-(--ease-expo)',
                            active || isOpen ? 'scale-x-100' : 'scale-x-0',
                          )}
                        />
                      </Link>

                      {item.menu ? (
                        /* The keyboard way in: takes no room and no clicks, and is
                           invisible until focused. Focus shows as a solid block
                           with the chevron knocked out of it rather than a ring,
                           which would have to overlap the label or the next item
                           in a 20px gap. */
                        <button
                          type="button"
                          data-toggle={item.label}
                          className={cn(
                            'pointer-events-none absolute -right-[1.125rem] top-1/2 flex h-6 w-3.5 -translate-y-1/2 items-center justify-center opacity-0',
                            'focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-none!',
                            dark ? 'focus-visible:bg-bone focus-visible:text-ink' : 'focus-visible:bg-ink focus-visible:text-bone',
                          )}
                          aria-expanded={isOpen}
                          aria-controls={slug(item.label)}
                          aria-label={`${item.label} menu`}
                          onClick={() => setOpenMenu(isOpen ? null : item.label)}
                        >
                          <Icon name={isOpen ? 'chevU' : 'chevD'} className="h-3 w-3" />
                        </button>
                      ) : null}
                    </span>

                    {item.menu ? (
                      <MegaMenu
                        item={item as NavItem & { menu: NonNullable<NavItem['menu']> }}
                        id={slug(item.label)}
                        open={isOpen}
                        switching={isOpen && menu.previous !== null && menu.previous !== item.label}
                        handoff={!isOpen && menu.current !== null}
                        onClose={closeMenu}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/"
            className={cn(
              'col-start-2 row-start-1 flex h-11 shrink-0 items-center transition-[opacity,translate] duration-[560ms] ease-(--ease-expo) hover:opacity-60',
              masthead && clear && 'pointer-events-none translate-y-1.5 opacity-0 focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100',
            )}
            aria-label="MERIT, home"
            onMouseEnter={() => { if (menu.current) scheduleClose(); }}
          >
            <Wordmark className="h-[22px] w-auto md:h-7" />
          </Link>

          <div
            className="col-start-3 row-start-1 flex items-center justify-end lg:gap-1"
            onMouseEnter={() => { if (menu.current) scheduleClose(); }}
          >
            <button
              type="button"
              data-opener="search"
              className="label group/nav mr-1 hidden min-h-11 items-center px-2 lg:flex"
              onClick={() => open('search')}
              aria-haspopup="dialog"
            >
              <Roll text="Search" />
            </button>
            <Link href="/account" className={cn(TAP, 'hidden sm:inline-flex')} aria-label="Account">
              <Icon name="account" />
            </Link>
            {/* Under 360px there is no room for four targets; the wishlist is
                one tap away in the menu, with its count. */}
            <Link href="/wishlist" className={cn(TAP, 'inline-flex max-[359px]:hidden')} aria-label={`Wishlist, ${ready ? wishlist.length : 0} saved`}>
              <Icon name="heart" filled={ready && wishlist.length > 0} />
            </Link>
            <button
              type="button"
              data-opener="cart"
              className="label group/nav nums flex min-h-11 shrink-0 items-center gap-2 pl-2"
              onClick={() => open('cart')}
              aria-haspopup="dialog"
              aria-label={`Shopping bag, ${ready ? count : 0} ${count === 1 ? 'item' : 'items'}`}
            >
              <span className="hidden sm:inline"><Roll text="Bag" /></span>
              <Icon name="bag" className="h-[18px] w-[18px] sm:hidden" />
              <span
                ref={bagCount}
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center px-1 text-[0.625rem] leading-none transition-colors duration-300',
                  ready && count > 0
                    ? dark ? 'bg-bone text-ink' : 'bg-ink text-bone'
                    : 'border border-current/35',
                )}
              >
                {ready ? count : 0}
              </span>
            </button>
          </div>
        </div>

        {/* The room dims while a menu is down. It never takes the pointer, so
            leaving the panel for the page is what closes it. */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 top-[calc(100%+1px)] hidden h-dvh bg-ink/25 transition-opacity duration-500 ease-(--ease-expo) lg:block',
            menu.current ? 'opacity-100' : 'opacity-0',
          )}
        />
      </header>
    </>
  );
}

/**
 * The label rolls up and a copy rolls in beneath it — a small, exact motion
 * that says "this is live" without underlining everything. The copy is
 * hidden from assistive tech; with reduced motion the swap is instant and,
 * the two being identical, invisible.
 */
function Roll({ text }: { text: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-(--ease-expo) group-hover/nav:-translate-y-full">
        {text}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-(--ease-expo) group-hover/nav:translate-y-0"
      >
        {text}
      </span>
    </span>
  );
}

/**
 * A hairline across the very top edge while the next page is on its way. It
 * starts on any same-site link click, creeps while waiting and completes when
 * the route (path or query) actually changes. Nothing is shown for links to
 * the page you are on.
 */
function RouteLine() {
  const pathname = usePathname();
  const params = useSearchParams();
  const line = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const safety = useRef<number | undefined>(undefined);
  const route = `${pathname}?${params.toString()}`;

  useEffect(() => {
    const el = line.current;
    if (!el) return;
    const { gsap } = setupGsap();

    const start = () => {
      running.current = true;
      gsap.killTweensOf(el);
      if (reduced()) {
        gsap.set(el, { opacity: 1, scaleX: 0.6 });
      } else {
        gsap.set(el, { opacity: 1, scaleX: 0 });
        gsap.to(el, { scaleX: 0.35, duration: 0.5, ease: 'power3.out' });
        gsap.to(el, { scaleX: 0.9, duration: 8, ease: 'power1.out', delay: 0.5 });
      }
      window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => {
        running.current = false;
        gsap.to(el, { opacity: 0, duration: 0.3 });
      }, 10000);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || !a.href || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const el = line.current;
    if (!el || !running.current) return;
    running.current = false;
    window.clearTimeout(safety.current);
    const { gsap } = setupGsap();
    gsap.killTweensOf(el);
    if (reduced()) {
      gsap.set(el, { opacity: 0 });
      return;
    }
    gsap.timeline()
      .to(el, { scaleX: 1, duration: 0.3, ease: 'power2.out' })
      .to(el, { opacity: 0, duration: 0.35, ease: 'power1.out' }, '+=0.05');
  }, [route]);

  useEffect(() => () => window.clearTimeout(safety.current), []);

  return <div ref={line} aria-hidden className="route-line" />;
}
