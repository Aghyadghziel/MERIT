import type { Metadata } from 'next';
import { SearchResults } from '@/components/commerce/SearchResults';
import { getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t('Search'),
    description: t('Search the MERIT range.'),
    robots: { index: false, follow: true },
  };
}

/**
 * No Suspense boundary here: the search reads its query from the address bar
 * as a store, so the page prerenders whole and hydrates in one pass.
 */
export default function SearchPage() {
  return <SearchResults />;
}
