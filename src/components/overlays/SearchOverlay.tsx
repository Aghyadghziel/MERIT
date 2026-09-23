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
import { SUGGESTED, clearRecent, hrefOf, pushRecent, readRecent, search, type Hit } from '@/lib/search';

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
      const t = window.setTimeout(() => setQuery(''), 320);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo(() => search(query), [query]);
  const flat = useMemo<Hit[]>(() => [...results.products, ...results.other], [results]);
  const hasQuery = query.trim().length >= 2;
  const empty = hasQuery && flat.length === 0;

  const go = (hit: Hit) => {
    pushRecent(query);
    close();
    router.push(hrefOf(hit));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!flat.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? flat.length - 1 : c - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[cursor >= 0 ? cursor : 0]);
    }
  };

  return (
    <Panel open={isOpen} onClose={close} label="Search" from="top" className="h-dvh md:h-auto md:max-h-[88dvh]">
      <div className="shrink-0 border-b border-line">
        <div className="page flex h-(--nav-h) items-center gap-4">
          <Icon name="search" className="h-[18px] w-[18px] shrink-0 text-mute" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(-1); }}
            onKeyDown={onKeyDown}
            placeholder="Search garments, collections and stories"
            aria-label="Search"
            aria-controls="search-results"
            autoComplete="off"
            className="display-sm h-full flex-1 bg-transparent font-normal outline-none placeholder:text-mute"
          />
          <button type="button" className="icon-btn shrink-0" onClick={close} aria-label="Close search">
            <Icon name="close" />
          </button>
        </div>
      </div>

      <div id="search-results" className="no-bar flex-1 overflow-y-auto" aria-live="polite">
        <div className="page py-8 md:py-10">
          {!hasQuery ? (
            <div className="grid-page">
              <div className="col-span-4 md:col-span-3 lg:col-span-3" data-panel-item>
                <p className="label-sm mb-4 text-mute">Suggested</p>
                <ul className="space-y-2.5">
                  {SUGGESTED.map((s) => (
                    <li key={s}>
                      <button type="button" className="link-quiet display-sm font-normal" onClick={() => setQuery(s)}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-4 md:col-span-3 lg:col-span-3" data-panel-item>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <p className="label-sm text-mute">Recent</p>
                  {recent.length > 0 ? (
                    <button
                      type="button"
                      className="label-sm text-mute hover:text-ink"
                      onClick={() => { clearRecent(); setRecent([]); }}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                {recent.length === 0 ? (
                  <p className="text-sm text-mute">Nothing searched yet.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" className="link-quiet text-sm" onClick={() => setQuery(r)}>{r}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-span-4 md:col-span-6 lg:col-span-6" data-panel-item>
                <p className="label-sm mb-4 text-mute">New this week</p>
                <div className="grid grid-cols-3 gap-(--gutter)">
                  {newArrivals().slice(0, 3).map((p) => (
                    <Link key={p.slug} href={`/products/${p.slug}`} onClick={close} className="group">
                      <div className="frame frame-4-5">
                        <Image src={`/img/${p.images[0]}.webp`} alt="" width={400} height={500} sizes="18vw"
                          className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]" />
                      </div>
                      <p className="mt-2.5 text-sm">{p.name}</p>
                      <Price amount={p.price} compareAt={p.compareAt} className="mt-1 text-mute" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : empty ? (
            <div>
              <p className="display-md">No results for “{query.trim()}”.</p>
              <p className="mt-3 max-w-md text-sm text-mute">
                Check the spelling, or try a material — cashmere, poplin, gabardine — or a
                collection name.
              </p>
              <p className="label-sm mt-10 mb-5 text-mute">You might look at</p>
              <div className="grid grid-cols-2 gap-x-(--gutter) gap-y-8 md:grid-cols-4">
                {newArrivals().slice(0, 4).map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} onClick={close} className="group">
                    <div className="frame frame-4-5">
                      <Image src={`/img/${p.images[0]}.webp`} alt="" width={400} height={500} sizes="(min-width:768px) 22vw, 45vw"
                        className="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]" />
                    </div>
                    <p className="mt-2.5 text-sm">{p.name}</p>
                    <Price amount={p.price} compareAt={p.compareAt} className="mt-1 text-mute" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid-page">
              <div className="col-span-4 md:col-span-6 lg:col-span-8">
                <p className="label-sm mb-5 text-mute">
                  {results.products.length} {results.products.length === 1 ? 'garment' : 'garments'}
                </p>
                <ul>
                  {results.products.map((hit, i) => (
                    <li key={hit.slug}>
                      <Link
                        href={hrefOf(hit)}
                        onClick={() => { pushRecent(query); close(); }}
                        onMouseEnter={() => setCursor(i)}
                        className={cn(
                          'flex items-center gap-4 border-b border-line py-3 transition-colors',
                          cursor === i && 'bg-bone-2',
                        )}
                      >
                        <div className="frame frame-4-5 w-14 shrink-0">
                          <Image src={`/img/${hit.image}.webp`} alt="" width={140} height={175} sizes="56px" />
                        </div>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{hit.title}</span>
                          <span className="label-sm mt-1 block text-mute">{hit.meta}</span>
                        </span>
                        {hit.kind === 'product' ? <Price amount={hit.price} compareAt={hit.compareAt} /> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-4 md:col-span-6 lg:col-span-4">
                <p className="label-sm mb-5 text-mute">Collections and stories</p>
                {results.other.length === 0 ? (
                  <p className="text-sm text-mute">No matches.</p>
                ) : (
                  <ul className="space-y-3">
                    {results.other.map((hit, i) => (
                      <li key={`${hit.kind}-${hit.slug}`}>
                        <Link
                          href={hrefOf(hit)}
                          onClick={() => { pushRecent(query); close(); }}
                          onMouseEnter={() => setCursor(results.products.length + i)}
                          className={cn(
                            'flex items-center gap-4 py-2 transition-colors',
                            cursor === results.products.length + i && 'bg-bone-2',
                          )}
                        >
                          <div className="frame frame-1-1 w-12 shrink-0">
                            <Image src={`/img/${hit.image}.webp`} alt="" width={120} height={120} sizes="48px" />
                          </div>
                          <span className="min-w-0">
                            <span className="block truncate text-sm">{hit.title}</span>
                            <span className="label-sm mt-1 block text-mute">{hit.meta}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
