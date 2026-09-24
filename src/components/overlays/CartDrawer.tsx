'use client';

import Image from 'next/image';
import Link from '@/i18n/link';
import { useCallback, useRef } from 'react';
import { DeliveryRule, LinePrice, RollingAmount, Stepper, Tally, lineKey, useBagActions, usePieces } from '@/components/commerce/CartView';
import { Panel } from '@/components/overlays/Panel';
import { FREE_SHIPPING, useStore, type Line } from '@/components/providers/Store';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { getProduct, isSoldOut, related } from '@/lib/catalog';
import { formatPrice, pad2 } from '@/lib/format';
import { useLocale, useT } from '@/i18n/client';
import { localizeProduct } from '@/i18n/products';

/** Where an empty bag sends you: the shop, read as an index. */
const START = [
  { label: 'New arrivals', href: '/new' },
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'The Index', href: '/collections/index' },
];

/**
 * The bag, from the right. It is the confirmation for every add, so it opens
 * on the pieces themselves: the delivery rule at the top, the lines, and one
 * black band with the figure and the way on.
 */
export function CartDrawer() {
  const { overlay, close } = useUi();
  const { bag, subtotal, count, wishlist, currency, ready } = useStore();
  const heading = useRef<HTMLHeadingElement>(null);
  const isOpen = overlay === 'cart';
  const code = ready ? currency : 'SAR';
  const t = useT();
  const locale = useLocale();
  const pieces = usePieces();

  // Two pieces near the one added last, for a bag with room to spare.
  const last = bag.length > 0 && bag.length < 3 ? getProduct(bag[bag.length - 1].slug) : undefined;
  const pairs = last
    ? related(last, 8)
      .filter((r) => !isSoldOut(r) && !bag.some((l) => l.slug === r.slug))
      .slice(0, 2)
      .map((r) => localizeProduct(r, locale))
    : [];

  const refocus = useCallback(() => {
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }, []);
  const { drop, step } = useBagActions(refocus);

  return (
    <Panel open={isOpen} onClose={close} label={t('Shopping bag')} from="right">
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line px-(--gutter) md:h-[4.5rem]">
        <h2 ref={heading} tabIndex={-1} className="flex items-baseline gap-3" style={{ outline: 'none' }}>
          {/* The title rises out of its own mask as the panel opens. The
              mask keeps room under the baseline for the tail of the g. */}
          <span
            className="inline-block overflow-hidden text-[1.625rem] font-semibold leading-none tracking-[-0.045em]"
            style={{ paddingBottom: '0.2em', marginBottom: '-0.2em' }}
          >
            <span data-panel-line className="inline-block">{t('Bag')}</span>
          </span>
          <Tally value={ready ? count : 0} className="label text-mute" />
          <span className="sr-only">{pieces(ready ? count : 0)}</span>
        </h2>
        <button type="button" className="icon-btn" onClick={close} aria-label={t('Close bag')}>
          <Icon name="close" />
        </button>
      </div>

      {!ready || count === 0 ? (
        <div className="no-bar flex flex-1 flex-col overflow-y-auto">
          <div className="px-(--gutter) pt-10" data-panel-item>
            <p className="display-md max-w-[12ch]">{t('Nothing in the bag yet.')}</p>
            <p className="mt-4 max-w-xs text-sm text-mute">
              {t('Pieces you add stay here, in this browser, until you take them out.')}
            </p>
          </div>

          <nav aria-label={t('Start shopping')} className="mt-10 px-(--gutter)">
            <p className="label-sm text-mute" data-panel-item>{t('Start with')}</p>
            <ul className="mt-3">
              {START.map((s, i) => (
                <li key={s.href} className="border-t border-ink last:border-b" data-panel-item>
                  <Link href={s.href} onClick={close} className="group flex min-h-16 items-center gap-4 py-3">
                    <span className="label-sm nums w-5 shrink-0 text-mute">{pad2(i + 1)}</span>
                    <span className="min-w-0 flex-1 truncate text-[clamp(1.75rem,1.35rem+1.4vw,2.375rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                      {t(s.label)}
                    </span>
                    <Icon name="arrowR" className="h-4 w-4 shrink-0 text-mute transition duration-300 group-hover:translate-x-0.5 group-hover:text-ink rtl:group-hover:-translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {ready && wishlist.length > 0 ? (
            <Link
              href="/wishlist"
              onClick={close}
              className="group mx-(--gutter) mt-8 flex min-h-11 items-center justify-between gap-4 text-sm"
              data-panel-item
            >
              <span className="flex items-center gap-2.5">
                <Icon name="heart" className="h-4 w-4" />
                {t('{pieces} in your wishlist', { pieces: pieces(wishlist.length) })}
              </span>
              <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          ) : null}

          {/* The signature, cropped by the foot of the panel. */}
          <div aria-hidden className="mt-auto overflow-hidden px-(--gutter) pt-14" data-panel-item>
            <Wordmark className="block h-auto w-full translate-y-[22%] text-bone-3" />
          </div>
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b border-line px-(--gutter) py-4" data-panel-item>
            <DeliveryRule />
          </div>

          <div className="no-bar flex-1 overflow-y-auto overscroll-contain px-(--gutter)">
            <ul>
              {bag.map((line) => (
                <DrawerRow key={lineKey(line)} line={line} onStep={step} onDrop={drop} onNavigate={close} />
              ))}
            </ul>

            {pairs.length > 0 ? (
              <section aria-labelledby="drawer-pairs" className="border-t border-line pb-8 pt-5" data-panel-item>
                <h3 id="drawer-pairs" className="label-sm text-mute">{t('You may also like')}</h3>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
                  {pairs.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                        <div className="frame frame-4-5">
                          <Image
                            src={`/img/${p.images[0]}.webp`}
                            alt=""
                            width={400}
                            height={500}
                            sizes="(min-width:480px) 200px, 45vw"
                            className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
                          />
                        </div>
                        <p className="mt-2.5 text-sm leading-snug">{p.name}</p>
                        <p className="mt-0.5 text-sm text-mute"><LinePrice product={p} /></p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className="on-ink shrink-0 bg-ink px-(--gutter) pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-bone">
            <div className="flex items-end justify-between gap-4" data-panel-item>
              <div>
                <p className="label">{t('Subtotal')}</p>
                <p className="label-sm mt-1.5 text-mute-ink">{pieces(count)}</p>
              </div>
              <RollingAmount value={subtotal} className="text-[2rem] font-semibold leading-[0.9] tracking-[-0.045em]" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mute-ink" data-panel-item>
              {t('Free Gulf delivery over {amount}. A concept store: checkout explains, nothing is charged.', {
                amount: formatPrice(FREE_SHIPPING, code, locale),
              })}
            </p>

            <div className="mt-5" data-panel-item>
              <Link href="/checkout" onClick={close} className="btn btn-solid group w-full justify-between px-5">
                <span>{t('Checkout')}</span>
                <Icon name="arrowR" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              <div className="mt-1.5 flex items-center justify-between gap-4">
                <Link href="/cart" onClick={close} className="label inline-flex min-h-11 items-center">
                  <span className="link-rule">{t('View bag')}</span>
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="label inline-flex min-h-11 items-center text-mute-ink transition-colors hover:text-bone"
                >
                  {t('Continue shopping')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

function DrawerRow({
  line, onStep, onDrop, onNavigate,
}: {
  line: Line;
  onStep: (key: string, delta: number, row: HTMLElement | null) => void;
  onDrop: (key: string, row: HTMLElement | null) => void;
  onNavigate: () => void;
}) {
  const row = useRef<HTMLLIElement>(null);
  const t = useT();
  const locale = useLocale();
  const found = getProduct(line.slug);
  if (!found) return null;
  const p = localizeProduct(found, locale);
  const key = lineKey(line);
  const href = `/products/${p.slug}`;

  return (
    <li ref={row} className="flex gap-4 border-b border-line py-5 last:border-b-0" data-panel-item>
      <Link href={href} onClick={onNavigate} className="group w-[5.5rem] shrink-0 self-start" tabIndex={-1} aria-hidden="true">
        <div className="frame frame-4-5">
          <Image
            src={`/img/${p.images[0]}.webp`}
            alt=""
            width={220}
            height={275}
            sizes="88px"
            className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.015em]">
              <Link href={href} onClick={onNavigate} className="link-quiet">{p.name}</Link>
            </h3>
            <p className="label-sm mt-1.5 text-mute">
              {t(line.colour)} · {line.size === 'One size' ? t('One size') : t('Size {size}', { size: line.size })}
            </p>
          </div>
          <LinePrice product={p} qty={line.qty} stack className="shrink-0 text-sm" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Stepper qty={line.qty} name={p.name} onStep={(d) => onStep(key, d, row.current)} />
          <button
            type="button"
            className="label-sm inline-flex min-h-11 items-center text-mute transition-colors hover:text-ink"
            onClick={() => onDrop(key, row.current)}
            aria-label={t('Remove {name} from your bag', { name: p.name })}
          >
            {t('Remove')}
          </button>
        </div>
      </div>
    </li>
  );
}
