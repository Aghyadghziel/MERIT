'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '@/components/overlays/Panel';
import { Price } from '@/components/commerce/Price';
import { useUi } from '@/components/providers/Ui';
import { Icon } from '@/components/ui/Icon';
import { newArrivals } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { pad2 } from '@/lib/format';
import { SUGGESTED, clearRecent, hrefOf, pushRecent, readRecent, search, type Hit } from '@/lib/search';

/** Underline the part of a name that matched, so you can see why it is here. */
function Match({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const at = q.length >= 2 ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent text-inherit underline decoration-1 underline-offset-[0.22em]">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

/**
 * Search, set at the size of a headline. What you type is the biggest thing
 * on the screen; results arrive as you type — garments as pictures, then
 * collections and stories — and the arrow keys walk through them. Enter opens
 * the one you are on, or the full results page if you are on none.
 */
export function SearchOverlay() {
  const { overlay, close } = useUi();
  const isOpen = overlay === 'search';
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setRecent(readRecent());
      setCursor(-1);
    } else {
      const t = window.setTimeout(() => setQuery(''), 420);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo(() => search(query), [query]);
  const flat = useMemo<Hit[]>(() => [...results.products, ...results.other], [results]);
  const hasQuery = query.trim().length >= 2;
  const empty = hasQuery && flat.length === 0;
  const arrivals = useMemo(() => newArrivals().slice(0, 4), []);
  // A suggestion is a promise: only offer the ones that find something.
  const suggested = useMemo(
    () => SUGGESTED.filter((s) => { const r = search(s); return r.products.length + r.other.length > 0; }),
    [],
  );
  const listOpen = hasQuery && flat.length > 0;

  // Keep the highlighted result on screen as the arrows move through a list
  // longer than the sheet.
  useEffect(() => {
    if (cursor < 0) return;
    document.getElementById(`search-hit-${cursor}`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const status = !hasQuery
    ? ''
    : empty
      ? `No results for ${query.trim()}.`
      : `${results.products.length} ${results.products.length === 1 ? 'garment' : 'garments'} and ${results.other.length} ${results.other.length === 1 ? 'collection or story' : 'collections and stories'}.`;

  const seeAll = `/search?q=${encodeURIComponent(query.trim())}`;

  const go = (href: string) => {
    pushRecent(query);
    close();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!flat.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? flat.length - 1 : c - 1));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cursor >= 0 && flat[cursor]) go(hrefOf(flat[cursor]));
    else if (hasQuery) go(seeAll);
  };

  const card = 'group block outline-offset-4';

  return (
    <Panel
      open={isOpen}
      onClose={close}
      label="Search"
      from="top"
      initialFocus={input}
      className="h-dvh md:h-auto md:max-h-[92dvh]"
    >
      <div className="page flex h-(--nav-h) shrink-0 items-center justify-between">
        <p className="label text-mute" data-panel-item>Search</p>
        <button
          type="button"
          className="label group/close -mr-2 flex min-h-11 items-center gap-2.5 px-2"
          onClick={close}
          aria-label="Close search"
        >
          <span className="hidden sm:inline">Close</span>
          <Icon name="close" className="h-[18px] w-[18px] transition-transform duration-500 ease-(--ease-expo) group-hover/close:rotate-90" />
        </button>
      </div>

      <form role="search" onSubmit={onSubmit} className="page shrink-0">
        <label htmlFor="search-input" className="sr-only">Search garments, collections and stories</label>
        <div className="flex items-end gap-4 pb-3 md:pb-5">
          <span className="block min-w-0 flex-1 overflow-hidden">
            <input
              ref={input}
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(-1); }}
              onKeyDown={onKeyDown}
              placeholder="Coat, cashmere, Atrium"
              // A combobox over two listboxes (garments, then collections and
              // stories): the arrow keys move aria-activedescendant through
              // both, so a screen reader hears each result as it is reached.
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={listOpen}
              aria-controls="search-garments search-other"
              aria-activedescendant={listOpen && cursor >= 0 ? `search-hit-${cursor}` : undefined}
              aria-describedby="search-status"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              data-panel-line
              className="block w-full bg-transparent pb-[0.06em] text-[clamp(2.25rem,0.9rem+5.4vw,6.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] caret-ink outline-none placeholder:text-hint"
            />
          </span>
          {query ? (
            <button
              type="button"
              className="label -mr-2 mb-[0.2em] flex min-h-11 shrink-0 items-center px-2 text-mute transition-colors hover:text-ink md:mb-[0.75em]"
              onClick={() => { setQuery(''); setCursor(-1); input.current?.focus(); }}
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="h-px origin-left bg-ink" data-panel-item />
        <div className="flex h-11 items-center justify-between gap-4" data-panel-item>
          <p id="search-status" className="label-sm nums text-mute">
            {hasQuery ? (empty ? 'No results' : `${pad2(flat.length)} results`) : 'Type two letters or more'}
          </p>
          <p className="label-sm hidden items-center gap-2 text-mute md:flex">
            <span>↑ ↓ to move</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="enter" className="h-3 w-3" /> to open</span>
            <span aria-hidden>·</span>
            <span>Esc to close</span>
          </p>
        </div>
      </form>
      <p className="sr-only" aria-live="polite">{status}</p>

      <div id="search-results" className="no-bar flex-1 overflow-y-auto">
        <div className="page pb-10 pt-6 md:pb-12 md:pt-8">
          {!hasQuery ? (
            <div className="grid-page gap-y-10">
              <div className="col-span-4 md:col-span-6 lg:col-span-4">
                <div data-panel-item>
                  <p className="label-sm text-mute">Suggested</p>
                  <ul className="mt-4">
                    {suggested.map((s, i) => (
                      <li key={s} className="border-b border-line first:border-t">
                        <button
                          type="button"
                          className="group/s flex min-h-12 w-full items-center gap-4 py-2 text-left"
                          onClick={() => { setQuery(s); input.current?.focus(); }}
                        >
                          <span className="label-sm nums w-6 text-mute">{pad2(i + 1)}</span>
                          <span className="flex-1 text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] font-semibold tracking-[-0.03em] transition-transform duration-500 ease-(--ease-expo) group-hover/s:translate-x-1.5">{s}</span>
                          <Icon name="arrowR" className="h-3.5 w-3.5 -translate-x-2 opacity-0 transition-[opacity,translate] duration-500 ease-(--ease-expo) group-hover/s:translate-x-0 group-hover/s:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {recent.length > 0 ? (
                  <div className="mt-10" data-panel-item>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="label-sm text-mute">Recent</p>
                      <button
                        type="button"
                        className="label-sm min-h-11 text-mute hover:text-ink"
                        onClick={() => { clearRecent(); setRecent([]); }}
                      >
                        Clear
                      </button>
                    </div>
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <li key={r}>
                          <button
                            type="button"
                            className="flex min-h-9 items-center border border-line-2 px-3 text-sm transition-colors hover:border-ink"
                            onClick={() => { setQuery(r); input.current?.focus(); }}
                          >
                            {r}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="col-span-4 md:col-span-6 lg:col-span-8">
                <p className="label-sm text-mute" data-panel-item>New this season</p>
                <ul className="mt-4 grid grid-cols-2 gap-x-(--gutter) gap-y-7 md:grid-cols-4">
                  {arrivals.map((p) => (
                    <li key={p.slug} data-panel-item>
                      <Link href={`/products/${p.slug}`} onClick={close} className={card}>
                        <div className="frame frame-4-5 frame-zoom">
                          <Image src={`/img/${p.images[0]}.webp`} alt="" width={480} height={600} sizes="(min-width: 768px) 16vw, 45vw" />
                        </div>
                        <p className="mt-3 text-sm leading-snug">{p.name}</p>
                        <Price amount={p.price} compareAt={p.compareAt} className="mt-1 text-mute" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : empty ? (
            <div>
              <p className="display-md max-w-3xl">Nothing matches “{query.trim()}”.</p>
              <p className="mt-4 max-w-md text-sm text-mute">
                Check the spelling, or try a material — cashmere, poplin, gabardine — or a
                collection name.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {suggested.slice(0, 4).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="flex min-h-9 items-center border border-line-2 px-3 text-sm transition-colors hover:border-ink"
                      onClick={() => { setQuery(s); input.current?.focus(); }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="label-sm mb-4 mt-12 text-mute">You might look at</p>
              <ul className="grid grid-cols-2 gap-x-(--gutter) gap-y-7 md:grid-cols-4 lg:w-2/3">
                {arrivals.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/products/${p.slug}`} onClick={close} className={card}>
                      <div className="frame frame-4-5 frame-zoom">
                        <Image src={`/img/${p.images[0]}.webp`} alt="" width={480} height={600} sizes="(min-width: 768px) 16vw, 45vw" />
                      </div>
                      <p className="mt-3 text-sm leading-snug">{p.name}</p>
                      <Price amount={p.price} compareAt={p.compareAt} className="mt-1 text-mute" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid-page gap-y-10">
              <section className="col-span-4 md:col-span-6 lg:col-span-9" aria-label="Garments">
                <p className="label-sm nums text-mute">
                  Garments <span className="text-ink">{pad2(results.products.length)}</span>
                </p>
                {results.products.length === 0 ? (
                  <p className="mt-4 text-sm text-mute">No garments by that name.</p>
                ) : (
                  <ul id="search-garments" role="listbox" aria-label="Garments" className="mt-4 grid grid-cols-2 gap-x-(--gutter) gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
                    {results.products.map((hit, i) => (
                      <li key={hit.slug} role="none">
                        {/* The link itself is the option, so nothing
                            interactive is nested inside one. */}
                        <Link
                          id={`search-hit-${i}`}
                          role="option"
                          aria-selected={cursor === i}
                          href={hrefOf(hit)}
                          onClick={() => { pushRecent(query); close(); }}
                          onMouseEnter={() => setCursor(i)}
                          className={card}
                          data-active={cursor === i || undefined}
                        >
                          <div className={cn('frame frame-4-5 frame-zoom', cursor === i && '[&_img]:scale-[1.04]')}>
                            <Image src={`/img/${hit.image}.webp`} alt="" width={480} height={600} sizes="(min-width: 1024px) 17vw, (min-width: 640px) 30vw, 45vw" />
                          </div>
                          <p className="mt-3 flex items-start justify-between gap-2 text-sm leading-snug">
                            <span className={cn('min-w-0', cursor === i && 'underline decoration-1 underline-offset-4')}>
                              <Match text={hit.title} query={query} />
                            </span>
                          </p>
                          <p className="label-sm mt-1.5 text-mute">{hit.meta}</p>
                          {hit.kind === 'product' ? <Price amount={hit.price} compareAt={hit.compareAt} className="mt-1.5" /> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="col-span-4 md:col-span-6 lg:col-span-3" aria-label="Collections and stories">
                <p className="label-sm nums text-mute">
                  Collections and stories <span className="text-ink">{pad2(results.other.length)}</span>
                </p>
                {results.other.length === 0 ? (
                  <p className="mt-4 text-sm text-mute">No matches.</p>
                ) : (
                  <ul id="search-other" role="listbox" aria-label="Collections and stories" className="mt-4 border-t border-line">
                    {results.other.map((hit, i) => {
                      const n = results.products.length + i;
                      return (
                        <li key={`${hit.kind}-${hit.slug}`} role="none" className="border-b border-line">
                          <Link
                            id={`search-hit-${n}`}
                            role="option"
                            aria-selected={cursor === n}
                            href={hrefOf(hit)}
                            onClick={() => { pushRecent(query); close(); }}
                            onMouseEnter={() => setCursor(n)}
                            className="group flex items-center gap-4 py-3"
                            data-active={cursor === n || undefined}
                          >
                            <div className="frame frame-4-5 frame-zoom w-14 shrink-0">
                              <Image src={`/img/${hit.image}.webp`} alt="" width={112} height={140} sizes="56px" />
                            </div>
                            <span className="min-w-0 flex-1">
                              <span className="label-sm block text-mute">{hit.kind === 'story' ? 'Story' : 'Collection'}</span>
                              <span className={cn('mt-1 block text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em]', cursor === n && 'underline decoration-1 underline-offset-4')}>
                                <Match text={hit.title} query={query} />
                              </span>
                              <span className="mt-1 block truncate text-xs text-mute">{hit.meta}</span>
                            </span>
                            <Icon name="arrowR" className={cn('h-3.5 w-3.5 shrink-0 transition-[opacity,translate] duration-500 ease-(--ease-expo)', cursor === n ? 'opacity-100' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100')} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <div className="col-span-4 md:col-span-6 lg:col-span-12">
                {/* Closes like every other result: on /search itself only the
                    query changes, which would not close the overlay. */}
                <Link href={seeAll} onClick={() => { pushRecent(query); close(); }} className="btn btn-ghost w-full sm:w-auto">
                  See every result for “{query.trim()}”
                  <Icon name="arrowR" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

