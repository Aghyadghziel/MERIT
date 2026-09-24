'use client';

import Link from '@/i18n/link';
import { useEffect, useRef, useState } from 'react';
import { MaskHeadline, Tally } from '@/components/commerce/CartView';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useStore } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { getProduct, isSoldOut, products, type Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { pad2, plural } from '@/lib/format';
import { reduced } from '@/lib/gsap';

/**
 * Saved pieces, hung as a rail: every other one drops, as on the home page.
 * A piece let go of here does not vanish — it stays in its place, dimmed,
 * with an undo, until the reader leaves the page. Nothing jumps under the
 * pointer, and a slip of the finger costs nothing. Let go of every piece and
 * the rail gives way to the empty page, with one undo for all of them.
 */
export function WishlistView() {
  const { wishlist, ready, count, toggleWish } = useStore();
  const rail = useRef<HTMLUListElement>(null);
  // The piece whose heart takes the keyboard back once an undo has landed.
  const restore = useRef<string | null>(null);

  // The order pieces are shown in: whatever was saved when the page opened,
  // with anything saved since put in front. Pieces removed here keep their
  // place. Adjusted during render rather than in an effect, as React advises
  // for state derived from a prop that changes.
  const [seen, setSeen] = useState<{ list: string[] | null; order: string[] }>({ list: null, order: [] });
  if (ready && seen.list !== wishlist) {
    const added = wishlist.filter((s) => !seen.order.includes(s));
    setSeen({ list: wishlist, order: [...added, ...seen.order] });
  }

  // Undo unmounts the button that had focus. Once the piece is saved again
  // and its card is live, put the keyboard back on that card's heart, so the
  // reader keeps their place in the rail instead of landing on <body>.
  useEffect(() => {
    const slug = restore.current;
    if (!slug || !wishlist.includes(slug)) return;
    restore.current = null;
    rail.current
      ?.querySelector<HTMLElement>(`li[data-slug="${slug}"] button[aria-pressed]`)
      ?.focus({ preventScroll: true });
  }, [wishlist]);

  if (!ready) return <div className="page min-h-[80svh] pt-(--nav-h)" aria-busy="true" />;

  const shown = seen.order
    .map((slug) => ({ p: getProduct(slug), gone: !wishlist.includes(slug) }))
    .filter((x): x is { p: Product; gone: boolean } => Boolean(x.p));
  const n = wishlist.length;
  // Everything on the page has just been let go of.
  const cleared = n === 0 && shown.length > 0;
  const picks = products
    .filter((p) => p.status === 'new' && !isSoldOut(p) && !wishlist.includes(p.slug) && !seen.order.includes(p.slug))
    .slice(0, 4);

  const undo = (slug: string) => {
    restore.current = slug;
    toggleWish(slug);
  };
  const undoAll = () => {
    restore.current = shown[0]?.p.slug ?? null;
    // Saving puts a piece first, so save them back last to first: the list
    // keeps the order it had, on this visit and the next.
    [...shown].reverse().forEach(({ p }) => toggleWish(p.slug));
  };

  return (
    <div className="page pt-(--nav-h)">
      <header className="pt-[clamp(2.25rem,1rem+4vw,5.5rem)]">
        <div className="flex items-baseline justify-between gap-4" data-reveal>
          <p className="label">Wishlist</p>
          <p className="label nums text-mute">{n > 0 ? `${plural(n, 'piece')} saved` : 'Nothing saved'}</p>
        </div>
        <div className="mt-[clamp(1.25rem,0.8rem+1.6vw,2.5rem)] flex items-end justify-between gap-6 border-b border-ink pb-[clamp(1.25rem,0.8rem+1.2vw,2rem)]">
          <h1 className="display-xl">
            <span className="sr-only">Wishlist — </span>
            <MaskHeadline text="Saved." />
          </h1>
          <span data-reveal className="flex shrink-0">
            <Tally value={n} className="display-xl mb-[-0.04em] text-line-2" />
          </span>
        </div>
      </header>

      {n > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5" data-reveal>
            <p className="max-w-lg text-sm text-mute">
              Kept in this browser, with no account behind it. Tap the{' '}
              <Icon name="heart" filled className="relative -top-px inline h-3.5 w-3.5 text-oxide" />
              <span className="sr-only">heart</span> on a piece again to let it go.
            </p>
            {count > 0 ? (
              <Link href="/cart" className="label group inline-flex min-h-11 items-center gap-2.5">
                Your bag <span className="nums text-mute">{pad2(count)}</span>
                <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : null}
          </div>

          <section aria-labelledby="saved-title" className="pb-(--section) pt-[clamp(1.5rem,1rem+2vw,3rem)]">
            <h2 id="saved-title" className="sr-only">Saved pieces</h2>
            <ul ref={rail} className="grid grid-cols-2 gap-x-(--gutter) gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {shown.map(({ p, gone }, i) => (
                <li
                  key={p.slug}
                  data-slug={p.slug}
                  className={cn(
                    'relative',
                    i % 2 === 1 ? 'mt-12' : 'mt-0',
                    i % 3 === 1 ? 'md:mt-16' : 'md:mt-0',
                    i % 2 === 1 ? 'lg:mt-28' : 'lg:mt-0',
                  )}
                >
                  <div
                    className={cn('transition-opacity duration-500', gone && 'opacity-30 grayscale')}
                    inert={gone}
                  >
                    <ProductCard product={p} index={i} sizes="(min-width:1024px) 23vw, (min-width:768px) 31vw, 47vw" />
                  </div>
                  {gone ? <Removed name={p.name} onUndo={() => undo(p.slug)} /> : null}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="pb-(--section)">
          {cleared ? <UndoAll pieces={shown.map(({ p }) => p)} onUndo={undoAll} /> : null}

          <div className="grid-page items-end gap-y-8 pt-[clamp(2rem,1rem+3vw,4rem)]">
            <div className="col-span-4 md:col-span-4 lg:col-span-6">
              <p className="display-md" data-reveal>{cleared ? 'Nothing saved now.' : 'Nothing saved yet.'}</p>
              <p className="body-lg mt-5 max-w-md text-mute" data-reveal>
                Tap the{' '}
                <Icon name="heart" className="relative -top-0.5 inline h-4 w-4 text-ink" />
                <span className="sr-only">heart</span> on any piece to keep it here. Saved pieces stay
                in this browser; there is no account behind them.
              </p>
            </div>
            <div className="col-span-4 flex flex-wrap gap-3 md:col-span-2 md:flex-col lg:col-span-5 lg:col-start-8 lg:flex-row lg:justify-end" data-reveal>
              <Link href="/women" className="btn btn-solid">Women</Link>
              <Link href="/men" className="btn">Men</Link>
            </div>
          </div>

          {picks.length > 0 ? (
            <section aria-labelledby="picks-title" className="mt-[clamp(3.5rem,2rem+5vw,7rem)]">
              <div className="flex items-baseline justify-between gap-6 border-t border-ink pt-4" data-reveal>
                <h2 id="picks-title" className="label">New this season — save one to start</h2>
                <Link href="/new" className="label group inline-flex shrink-0 items-center gap-2">
                  <span className="hidden sm:inline">All new</span>
                  <span className="sm:hidden">All</span>
                  <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-(--gutter) gap-y-12 lg:grid-cols-4">
                {picks.map((p, i) => (
                  <div key={p.slug} className={cn(i % 2 === 1 && 'mt-10 lg:mt-20')}>
                    <ProductCard product={p} index={i} sizes="(min-width:1024px) 23vw, 47vw" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Laid over a piece that has just been let go of, until the page is left. */
function Removed({ name, onUndo }: { name: string; onUndo: () => void }) {
  const button = useRef<HTMLButtonElement>(null);

  // The heart that had focus has just gone inert; catch the keyboard here
  // rather than letting it fall back to the top of the page.
  useEffect(() => {
    const active = document.activeElement;
    if (!active || active === document.body || active.closest('[inert]')) {
      button.current?.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div className="absolute inset-x-0 top-0 flex aspect-[4/5] flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="label">Removed</p>
      <button
        ref={button}
        type="button"
        className="btn btn-solid min-w-[8.5rem]"
        onClick={onUndo}
        aria-label={`Undo — save ${name} again`}
      >
        Undo
      </button>
    </div>
  );
}

/**
 * When the last saved piece is let go of, the dimmed rail would read as a
 * wall of undo buttons under a heading that says nothing is saved. It gives
 * way to one line instead: what was just let go of, and a single undo.
 */
function UndoAll({ pieces, onUndo }: { pieces: Product[]; onUndo: () => void }) {
  const button = useRef<HTMLButtonElement>(null);

  // The rail has just collapsed from under the reader, who was most likely
  // scrolled down it. Bring the top of the page back, where this line now
  // sits, and catch the keyboard: the heart that was pressed has gone.
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reduced() ? 'instant' : 'smooth' });
    const active = document.activeElement;
    if (!active || active === document.body || active.closest('[inert]')) {
      button.current?.focus({ preventScroll: true });
    }
  }, []);

  const k = pieces.length;
  return (
    <div className="flex flex-col gap-4 border-b border-line py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <p className="min-w-0 text-sm">
        <span className="label mr-3">Removed</span>
        <span className="text-mute">
          {k === 1 ? pieces[0].name : `${plural(k, 'piece')}: ${pieces.map((p) => p.name).join(', ')}`}.
        </span>
      </p>
      <button
        ref={button}
        type="button"
        className="btn btn-solid shrink-0 self-start sm:self-auto"
        onClick={onUndo}
        aria-label={k === 1 ? `Undo — save ${pieces[0].name} again` : `Undo — save all ${k} pieces again`}
      >
        {k === 1 ? 'Undo' : 'Undo all'}
      </button>
    </div>
  );
}
