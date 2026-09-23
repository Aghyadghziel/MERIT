'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Panel } from '@/components/overlays/Panel';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { useStore } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import { NAV } from '@/lib/nav';

/**
 * A layered menu rather than a stack of accordions: the top level stays where
 * it is and the sub-menu slides over it, so you always know which way is back.
 */
export function MobileNav() {
  const { overlay, close, open } = useUi();
  const { wishlist, ready } = useStore();
  const isOpen = overlay === 'menu';
  const [layer, setLayer] = useState<string | null>(null);
  const sub = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!isOpen) setLayer(null); }, [isOpen]);

  useEffect(() => {
    const el = sub.current;
    if (!el) return;
    const { gsap } = setupGsap();
    if (reduced()) { gsap.set(el, { xPercent: layer ? 0 : 100 }); return; }
    const anim = gsap.to(el, {
      xPercent: layer ? 0 : 100,
      duration: DUR.panel,
      ease: EASE.big,
    });
    return () => { anim.kill(); };
  }, [layer]);

  const item = NAV.find((n) => n.label === layer);

  return (
    <Panel open={isOpen} onClose={close} label="Menu" from="top" className="h-dvh lg:hidden">
      <div className="flex h-(--nav-h) shrink-0 items-center justify-between border-b border-line pl-(--gutter) pr-2">
        <Link href="/" onClick={close} aria-label="MERIT — home">
          <Wordmark className="h-4 w-auto" />
        </Link>
        <button type="button" className="icon-btn mr-2" onClick={close} aria-label="Close menu">
          <Icon name="close" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Level one */}
        <div className="no-bar h-full overflow-y-auto px-(--gutter) py-6">
          <ul>
            {NAV.map((n) => (
              <li key={n.label} data-panel-item className="border-b border-line">
                {n.menu ? (
                  <button
                    type="button"
                    className="display-md flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left"
                    onClick={() => setLayer(n.label)}
                    aria-expanded={layer === n.label}
                  >
                    {n.label}
                    <Icon name="chevR" className="h-5 w-5 text-mute" />
                  </button>
                ) : (
                  <Link href={n.href} onClick={close} className="display-md flex min-h-16 items-center py-3">
                    {n.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <ul className="mt-8 space-y-1" data-panel-item>
            <li>
              <button
                type="button"
                onClick={() => open('search')}
                className="label flex min-h-12 w-full items-center gap-3"
              >
                <Icon name="search" className="h-4 w-4" /> Search
              </button>
            </li>
            <li>
              <Link href="/account" onClick={close} className="label flex min-h-12 items-center gap-3">
                <Icon name="account" className="h-4 w-4" /> Account
              </Link>
            </li>
            <li>
              <Link href="/wishlist" onClick={close} className="label flex min-h-12 items-center gap-3">
                <Icon name="heart" className="h-4 w-4" /> Wishlist
                {ready && wishlist.length ? <span className="nums text-mute">({wishlist.length})</span> : null}
              </Link>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6" data-panel-item>
            <CurrencySelect id="currency-mobile" />
            <label className="flex items-center gap-2">
              <span className="sr-only">Language</span>
              <select className="label bg-transparent py-1" defaultValue="en">
                <option value="en">English</option>
                <option value="ar" disabled>العربية — in preparation</option>
              </select>
            </label>
          </div>
        </div>

        {/* Level two */}
        <div
          ref={sub}
          className="absolute inset-0 translate-x-full bg-bone"
          aria-hidden={!layer}
          inert={!layer}
        >
          {item?.menu ? (
            <div className="no-bar h-full overflow-y-auto px-(--gutter) py-5">
              <button
                type="button"
                onClick={() => setLayer(null)}
                className="label flex min-h-12 items-center gap-2.5 text-mute"
              >
                <Icon name="chevL" className="h-4 w-4" /> {item.label}
              </button>

              {item.menu.columns.map((col) => (
                <div key={col.title} className="mt-7">
                  <p className="label-sm mb-3 text-mute">{col.title}</p>
                  <ul>
                    {col.links.map((l) => (
                      <li key={l.label} className="border-b border-line">
                        <Link href={l.href} onClick={close} className="display-sm flex min-h-14 items-center py-2">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <Link href={item.menu.feature.href} onClick={close} className="mt-9 block">
                <div className="frame frame-3-2">
                  <Image src={`/img/${item.menu.feature.image}.webp`} alt="" width={900} height={600} sizes="100vw" />
                </div>
                <p className="label-sm mt-3 text-mute">{item.menu.feature.kicker}</p>
                <p className="display-sm mt-1">{item.menu.feature.title}</p>
              </Link>

              <Link href={item.menu.viewAll.href} onClick={close} className="btn btn-ghost mt-7 w-full">
                {item.menu.viewAll.label}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
