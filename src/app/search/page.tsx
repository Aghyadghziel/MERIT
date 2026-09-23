import type { Metadata } from 'next';
import { SearchResults } from '@/components/commerce/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the MERIT range.',
  robots: { index: false, follow: true },
};

/**
 * No Suspense boundary here: the search reads its query from the address bar
 * as a store, so the page prerenders whole and hydrates in one pass.
 */
export default function SearchPage() {
  return <SearchResults />;
}
