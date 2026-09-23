'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { cn } from '@/lib/cn';
import { NAV } from '@/lib/nav';

/**
 * One row, everything left-aligned off the same margin as the page grid. The
 * header sits over the campaign image on pages that ask for it — those mark a
 * section with data-header-over — and turns to bone once that image is passed.
 */
export function Header() {
  const [solid, setSolid] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const pathname = usePathname();
  const { count, wishlist, ready } = useStore();
  const { open } = useUi();

  // Work out whether this page wants a transparent header, and switch as soon
  // as the opening image has scrolled past.
  useEffect(() => {
    const over = document.querySelector<HTMLElement>('[data-header-over]');
    if (!over) {
      setSolid(true);
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16 || 80;
      setSolid(window.scrollY > over.offsetHeight - nav - 8);
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

  useEffect(() => { setOpenMenu(null); }, [pathname]);

  // A short grace period so moving diagonally between the link and the panel
  // does not close it.
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  }, []);
  const cancelClose = useCallback(() => window.clearTimeout(closeTimer.current), []);

  const dark = !solid && !openMenu;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        dark ? 'on-ink text-bone' : 'bg-bone text-ink rule-b',
      )}
      onMouseLeave={scheduleClose}
    >
      {/* A short scrim only where the header sits, so white type stays legible
          over a light photograph without dimming the whole image. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent transition-opacity duration-300',
          dark ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div className="page relative flex h-(--nav-h) items-center gap-6 lg:gap-10">
        <Link href="/" className="shrink-0" aria-label="MERIT — home">
          <Wordmark className="h-4 w-auto md:h-[18px]" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li
                  key={item.label}
                  onMouseEnter={() => { cancelClose(); setOpenMenu(item.menu ? item.label : null); }}
                >
                  <Link
                    href={item.href}
                    className={cn('label relative block py-2 transition-opacity hover:opacity-60', active && 'opacity-100')}
                    aria-haspopup={item.menu ? 'true' : undefined}
                    aria-expanded={item.menu ? openMenu === item.label : undefined}
                    aria-controls={item.menu ? `menu-${item.label.toLowerCase()}` : undefined}
                    onFocus={() => setOpenMenu(item.menu ? item.label : null)}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-0 -bottom-px h-px origin-left bg-current transition-transform duration-200',
                        active || openMenu === item.label ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button type="button" className="icon-btn" onClick={() => open('search')} aria-label="Search">
            <Icon name="search" />
          </button>
          <Link href="/account" className="icon-btn hidden sm:inline-flex" aria-label="Account">
            <Icon name="account" />
          </Link>
          <Link href="/wishlist" className="icon-btn relative" aria-label={`Wishlist, ${ready ? wishlist.length : 0} saved`}>
            <Icon name="heart" />
            {ready && wishlist.length > 0 ? <Dot /> : null}
          </Link>
          <button
            type="button"
            className="icon-btn relative"
            onClick={() => open('cart')}
            aria-label={`Shopping bag, ${ready ? count : 0} ${count === 1 ? 'item' : 'items'}`}
          >
            <Icon name="bag" />
            {ready && count > 0 ? (
              <span className="label-sm nums absolute -right-0.5 top-1.5 tabular-nums">{count}</span>
            ) : null}
          </button>
          <button
            type="button"
            className="icon-btn lg:hidden"
            onClick={() => open('menu')}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <MegaMenu
        openLabel={openMenu}
        onClose={() => setOpenMenu(null)}
        onEnter={cancelClose}
        onLeave={scheduleClose}
      />
    </header>
  );
}

function Dot() {
  return (
    <span aria-hidden className="absolute right-1.5 top-2 block h-1 w-1 rounded-full bg-oxide" />
  );
}
