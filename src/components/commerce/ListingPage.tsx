'use client';

import { Suspense } from 'react';
import { Listing } from '@/components/commerce/Listing';
import type { Product } from '@/lib/catalog';

type Props = React.ComponentProps<typeof Listing>;

/** useSearchParams needs a boundary; the skeleton keeps the page height stable. */
export function ListingPage(props: Props) {
  return (
    <Suspense fallback={<Skeleton pool={props.pool} title={props.title} />}>
      <Listing {...props} />
    </Suspense>
  );
}

function Skeleton({ pool, title }: { pool: Product[]; title: string }) {
  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm">
        <h1 className="display-lg mt-4 max-w-4xl">{title}</h1>
      </header>
      <div className="rule-t rule-b flex h-14 items-center">
        <p className="label text-mute">{pool.length} pieces</p>
      </div>
      <div className="grid grid-cols-2 gap-x-(--gutter) gap-y-12 pb-(--section) pt-10 md:grid-cols-3 lg:grid-cols-4">
        {pool.slice(0, 8).map((p) => (
          <div key={p.slug}>
            <div className="frame frame-4-5 bg-bone-2" />
            <div className="mt-3.5 h-4 w-2/3 bg-bone-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
