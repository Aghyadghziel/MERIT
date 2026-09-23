'use client';

import { Listing, type ListingProps } from '@/components/commerce/Listing';

/**
 * The entry point pages use. The listing reads its filters from the address
 * bar without a Suspense boundary, so the prerendered page already carries the
 * title, the category index and every piece — for search engines, for readers
 * without script, and for a first paint that does not jump.
 */
export function ListingPage(props: ListingProps) {
  return <Listing {...props} />;
}
