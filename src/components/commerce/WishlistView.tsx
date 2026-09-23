'use client';

import Link from 'next/link';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { useStore } from '@/components/providers/Store';
import { getProduct } from '@/lib/catalog';
import { plural } from '@/lib/format';

export function WishlistView() {
  const { wishlist, ready } = useStore();
  const items = ready ? wishlist.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p)) : [];

  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm">
        <h1 className="display-lg">Wishlist</h1>
        {ready && items.length > 0 ? (
          <p className="label nums mt-4 text-mute">{plural(items.length, 'piece')} saved</p>
        ) : null}
      </header>

      {!ready ? (
        <div className="rule-t h-64" />
      ) : items.length === 0 ? (
        <div className="rule-t max-w-lg py-16">
          <p className="display-md">Nothing saved yet.</p>
          <p className="mt-4 text-sm text-mute">
            The heart on any photograph keeps a piece here. Wishlists stay on this device — there
            is no account behind them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/women" className="btn btn-solid">Women</Link>
            <Link href="/men" className="btn">Men</Link>
          </div>
        </div>
      ) : (
        <div className="rule-t pb-(--section) pt-10">
          <ProductGrid products={items} columns={4} label="Saved pieces" />
        </div>
      )}
    </div>
  );
}
