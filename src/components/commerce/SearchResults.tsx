'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Icon } from '@/components/ui/Icon';
import { getProduct, newArrivals } from '@/lib/catalog';
import { hrefOf, search, SUGGESTED } from '@/lib/search';
import { plural } from '@/lib/format';

/** The full-page counterpart to the overlay, for shared and bookmarked queries. */
export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);

  const results = useMemo(() => search(initial), [initial]);
  const found = results.products
    .map((h) => getProduct(h.slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm">
        <h1 className="sr-only">Search</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(query)}`); }}
          className="max-w-3xl"
        >
          <label htmlFor="search-page" className="label text-mute">Search</label>
          <div className="mt-3 flex items-center gap-4 border-b border-line-2 focus-within:border-ink">
            <input
              id="search-page"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Garments, collections and stories"
              className="display-md w-full bg-transparent py-3 font-normal outline-none placeholder:text-mute"
            />
            <button type="submit" className="icon-btn" aria-label="Search">
              <Icon name="arrowR" />
            </button>
          </div>
        </form>

        {initial ? (
          <p className="label nums mt-6 text-mute" aria-live="polite">
            {plural(found.length, 'result')} for “{initial}”
          </p>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="label-sm mr-1 text-mute">Try</span>
            {SUGGESTED.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="label-sm border border-line px-3 py-1.5 transition-colors hover:border-ink"
              >
                {s}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="rule-t pb-(--section) pt-10">
        {initial && found.length === 0 ? (
          <div className="max-w-lg">
            <p className="display-md">No results for “{initial}”.</p>
            <p className="mt-4 text-sm text-mute">
              Try a material — cashmere, poplin, gabardine — or a collection name.
            </p>
            <p className="label-sm mb-6 mt-12 text-mute">You might look at</p>
            <ProductGrid products={newArrivals().slice(0, 4)} columns={4} label="Suggested pieces" />
          </div>
        ) : found.length > 0 ? (
          <>
            <ProductGrid products={found} columns={4} label="Search results" />
            {results.other.length > 0 ? (
              <div className="mt-16">
                <h2 className="label rule-t pt-4">Collections and stories</h2>
                <ul className="mt-8 grid gap-x-(--gutter) gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {results.other.map((hit) => (
                    <li key={`${hit.kind}-${hit.slug}`}>
                      <Link href={hrefOf(hit)} className="group flex items-center gap-4">
                        <div className="frame frame-1-1 w-20 shrink-0">
                          <Image src={`/img/${hit.image}.webp`} alt="" width={200} height={200} sizes="80px"
                            className="transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <span>
                          <span className="block text-sm">{hit.title}</span>
                          <span className="label-sm mt-1 block text-mute">{hit.meta}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <ProductGrid products={newArrivals()} columns={4} label="New arrivals" />
        )}
      </div>
    </div>
  );
}
