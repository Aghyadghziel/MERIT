'use client';

import Link from '@/i18n/link';
import { Suspense, useDeferredValue, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { notifyQuery, QueryWatch, useLocationQuery } from '@/components/commerce/Listing';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { ArtImage } from '@/components/editorial/ArtImage';
import { Icon } from '@/components/ui/Icon';
import { useLocale, useT } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { getProduct, newArrivals } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { pad2 } from '@/lib/format';
import { countOf } from '@/lib/nav';
import { clearRecent, hrefOf, pushRecent, readRecent, search, suggestedFor, type Hit } from '@/lib/search';

// ─── Recent searches, as a store so they render after hydration ────────────

const recentListeners = new Set<() => void>();
const notifyRecent = () => recentListeners.forEach((l) => l());
const subscribeRecent = (cb: () => void) => {
  recentListeners.add(cb);
  return () => { recentListeners.delete(cb); };
};
const recentSnapshot = () => JSON.stringify(readRecent());
const noRecent = () => '[]';

const KIND: Record<Hit['kind'], string> = { product: 'Piece', collection: 'Collection', story: 'Story' };

/**
 * A word in a label line that can be pressed: set in the label's own capitals
 * (buttons do not inherit text-transform), drawn 32px tall, with a 44px target.
 * link-quiet draws its rule with ::after, so the target is the ::before.
 */
const HIT = "link-quiet relative min-h-8 uppercase before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-['']";

/**
 * The full-page search. The query is typed at poster size and the results
 * follow the keystrokes; the address bar keeps up a moment later, so a
 * search can still be bookmarked and shared. With nothing typed, the page
 * offers the suggested searches as an index and the newest pieces below.
 */
export function SearchResults() {
  const t = useT();
  const locale = useLocale();
  // A suggestion is a promise: only offer the ones that find something.
  const SUGGESTED = useMemo(
    () => suggestedFor(locale).filter((s) => { const r = search(s, locale); return r.products.length + r.other.length > 0; }),
    [locale],
  );
  const here = localePath('/search', locale);
  const urlQuery = new URLSearchParams(useLocationQuery()).get('q') ?? '';
  const [text, setText] = useState(urlQuery);
  // The last query this page wrote to, or read from, the address bar. When
  // the address changes from outside (a link, the header's search, the back
  // button), the field follows; our own writes do not echo back into it.
  const [synced, setSynced] = useState(urlQuery);
  if (urlQuery !== synced) {
    setSynced(urlQuery);
    setText(urlQuery);
  }

  const input = useRef<HTMLInputElement>(null);
  const term = useDeferredValue(text.trim());
  const results = useMemo(() => search(term, locale), [term, locale]);
  const found = useMemo(
    () => results.products.map((h) => getProduct(h.slug)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [results],
  );
  const recent = JSON.parse(useSyncExternalStore(subscribeRecent, recentSnapshot, noRecent)) as string[];
  const fresh = useMemo(() => newArrivals(), []);

  const write = (q: string) => {
    setSynced(q);
    window.history.replaceState(null, '', q ? `${here}?q=${encodeURIComponent(q)}` : here);
    notifyQuery();
  };

  // The address follows the field once typing pauses.
  useEffect(() => {
    const q = text.trim();
    if (q === synced) return;
    const t = window.setTimeout(() => {
      setSynced(q);
      window.history.replaceState(null, '', q ? `${here}?q=${encodeURIComponent(q)}` : here);
      notifyQuery();
    }, 400);
    return () => window.clearTimeout(t);
  }, [text, synced, here]);

  const run = (q: string) => {
    setText(q);
    write(q.trim());
    pushRecent(q);
    notifyRecent();
  };

  const searching = term.length >= 2;
  const nCollections = results.other.filter((h) => h.kind === 'collection').length;
  const nStories = results.other.filter((h) => h.kind === 'story').length;
  const tally = [
    found.length ? countOf(found.length, locale, ['piece', 'pieces'], ['قطعة واحدة', 'قطعتان', 'قطع', 'قطعة']) : '',
    nCollections ? countOf(nCollections, locale, ['collection', 'collections'], ['مجموعة واحدة', 'مجموعتان', 'مجموعات', 'مجموعة']) : '',
    nStories ? countOf(nStories, locale, ['story', 'stories'], ['قصة واحدة', 'قصتان', 'قصص', 'قصة']) : '',
  ].filter(Boolean);
  const status = !term
    ? t('Pieces, collections and stories')
    : !searching
      ? t('Two letters or more')
      : tally.length
        ? t('{tally} — “{term}”', { tally: tally.join(' · '), term })
        : t('Nothing for “{term}”', { term });

  return (
    <div className="page pb-(--section) pt-[calc(var(--nav-h)+clamp(1.5rem,4vw,3.5rem))]">
      <Suspense fallback={null}>
        <QueryWatch />
      </Suspense>
      <h1 className="sr-only">{searching ? t('Search results for “{term}”', { term }) : t('Search')}</h1>

      {/* ─── The field ─────────────────────────────────────────────── */}
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); run(text); input.current?.blur(); }}
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3" data-reveal>
          <label htmlFor="search-page" className="label">{t('Search the range')}</label>
          <p className="label hidden text-mute sm:block">{t('Enter to search · Esc to clear')}</p>
        </div>
        <div className="mt-[clamp(0.75rem,2vw,1.75rem)] flex items-center gap-2 border-b-2 border-ink pb-1 transition-shadow duration-300 focus-within:shadow-[0_2px_0_0_var(--color-ink)] md:gap-4 md:pb-2">
          <input
            ref={input}
            id="search-page"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape' && text) { e.preventDefault(); setText(''); } }}
            placeholder={t('Type to search')}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-1 text-[clamp(2.5rem,0.9rem+7.4vw,8.5rem)] font-semibold leading-[1] tracking-[-0.05em] outline-none placeholder:text-hint focus-visible:outline-none"
          />
          {text ? (
            <button
              type="button"
              onClick={() => { setText(''); write(''); input.current?.focus(); }}
              className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
              aria-label={t('Clear search')}
            >
              <Icon name="close" className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          ) : null}
          <button
            type="submit"
            aria-label={t('Search')}
            className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink text-bone transition-colors duration-300 hover:bg-ink-3 md:h-16 md:w-16"
          >
            <Icon name="arrowR" className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <p className="label nums text-mute" aria-live="polite" aria-atomic="true">{status}</p>
        {searching ? (
          <p className="label flex flex-wrap items-baseline gap-x-4 gap-y-1 text-mute">
            <span>{t('Try')}</span>
            {SUGGESTED.filter((s) => s.toLowerCase() !== term.toLowerCase()).slice(0, 4).map((s) => (
              <button key={s} type="button" onClick={() => run(s)} className={cn(HIT, 'text-ink')}>
                {s}
              </button>
            ))}
          </p>
        ) : null}
      </div>

      {/* ─── Results ───────────────────────────────────────────────── */}
      {!searching ? (
        <>
          <section aria-labelledby="try-title" className="mt-[clamp(3rem,7vw,6rem)]">
            <div className="flex items-baseline justify-between gap-6" data-reveal>
              <h2 id="try-title" className="label">
                <span className="nums me-3 text-mute">01</span>
                {t('Suggested')}
              </h2>
              {recent.length ? (
                <div className="label flex min-w-0 flex-wrap items-baseline justify-end gap-x-4 gap-y-1 text-mute">
                  <span>{t('Recent')}</span>
                  {recent.slice(0, 4).map((r) => (
                    <button key={r} type="button" onClick={() => run(r)} className={cn(HIT, 'text-ink')}>{r}</button>
                  ))}
                  <button type="button" onClick={() => { clearRecent(); notifyRecent(); }} className={HIT}>{t('Clear')}</button>
                </div>
              ) : null}
            </div>
            <ul className="mt-5">
              {SUGGESTED.map((s, i) => (
                <li key={s} className="border-t border-ink last:border-b" data-reveal>
                  <button
                    type="button"
                    onClick={() => run(s)}
                    className="group flex w-full items-center gap-4 py-[clamp(0.75rem,0.4rem+1.1vw,1.5rem)] text-start md:gap-8"
                  >
                    <span className="label-sm nums w-6 shrink-0 text-mute">{pad2(i + 1)}</span>
                    <span className="min-w-0 flex-1 truncate text-[clamp(1.875rem,0.6rem+5.4vw,6.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.055em] transition-transform duration-700 ease-expo md:group-hover:translate-x-4 rtl:md:group-hover:-translate-x-4">
                      {s}
                    </span>
                    <Icon name="arrowR" className="h-5 w-5 shrink-0 -translate-x-2 rtl:translate-x-2 opacity-0 transition-[opacity,transform,translate] duration-500 ease-expo group-hover:translate-x-0 rtl:group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 rtl:group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:h-7 md:w-7" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <Block n={2} title={t('New in the studio')} count={fresh.length} className="mt-[clamp(4rem,9vw,8rem)]">
            {/* On a phone with recent searches, its first row peeks into the first screen. */}
            <ProductGrid products={fresh} columns={4} priorityCount={2} />
          </Block>
        </>
      ) : found.length === 0 && results.other.length === 0 ? (
        <>
          <div className="mt-[clamp(3rem,7vw,6rem)] max-w-3xl">
            <p className="display-lg">{t('Nothing for “{term}”.', { term })}</p>
            <p className="body-lg mt-6 max-w-[34rem] text-mute">
              {t('Try a material — cashmere, poplin, gabardine — a category, or the name of a collection.')}
            </p>
          </div>
          <Block n={1} title={t('In the studio now')} count={Math.min(4, fresh.length)} className="mt-[clamp(4rem,8vw,7rem)]">
            <ProductGrid products={fresh.slice(0, 4)} columns={4} priorityCount={4} />
          </Block>
        </>
      ) : (
        <>
          {found.length ? (
            <Block n={1} title={t('Pieces')} more={t(' matching “{term}”', { term })} count={found.length} className="mt-[clamp(3rem,6vw,5rem)]">
              <ProductGrid products={found} columns={found.length <= 3 ? 3 : 4} priorityCount={4} />
            </Block>
          ) : null}
          {results.other.length ? (
            <Block
              n={found.length ? 2 : 1}
              title={t('Collections and stories')}
              count={results.other.length}
              className="mt-[clamp(4rem,8vw,7rem)]"
            >
              <ul
                className={cn(
                  'grid gap-x-(--gutter) gap-y-12',
                  results.other.length === 2 ? 'md:grid-cols-2' : results.other.length > 2 ? 'md:grid-cols-3' : null,
                )}
              >
                {results.other.map((hit) => {
                  const single = results.other.length === 1;
                  return (
                    <li key={`${hit.kind}-${hit.slug}`} data-reveal>
                      <Link
                        href={hrefOf(hit)}
                        className={cn('group block', single && 'md:grid md:grid-cols-12 md:items-end md:gap-x-(--gutter)')}
                      >
                        <div className={cn('frame frame-3-2 frame-zoom', single && 'md:col-span-7')}>
                          <ArtImage
                            wide={hit.image}
                            alt=""
                            sizes={single ? '(min-width:768px) 58vw, 100vw' : results.other.length === 2 ? '(min-width:768px) 48vw, 100vw' : '(min-width:768px) 32vw, 100vw'}
                          />
                        </div>
                        <div className={cn(single && 'md:col-span-5 md:pb-1')}>
                          <p className="label mt-4 text-mute">
                            {t(KIND[hit.kind])} <span aria-hidden>·</span> {hit.meta}
                          </p>
                          <p className={cn('mt-2', single ? 'display-lg' : 'display-md')}>{hit.title}</p>
                          <span className="label link-arrow mt-4 md:mt-6">
                            {t(hit.kind === 'story' ? 'Read the story' : 'View the collection')}
                            <Icon name="arrowR" className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Block>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * A numbered block of results. Its heading is the only one the block has:
 * the grid inside is not given a second, hidden one. `more` finishes the
 * heading for a screen reader, e.g. the term the pieces match.
 */
function Block({
  n, title, more, count, className, children,
}: { n: number; title: string; more?: string; count: number; className?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section className={className} aria-labelledby={id}>
      <div className="mb-[clamp(1.75rem,3.5vw,3rem)] flex items-baseline justify-between gap-6 border-t border-ink pt-4" data-reveal>
        <h2 id={id} className="label">
          <span className="nums me-3 text-mute" aria-hidden>{pad2(n)}</span>
          {title}
          {more ? <span className="sr-only">{more}</span> : null}
        </h2>
        <p className="label nums text-mute">{pad2(count)}</p>
      </div>
      {children}
    </section>
  );
}
