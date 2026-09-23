import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/components/commerce/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the MERIT range.',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page pt-(--nav-h)"><div className="section-y h-64" /></div>}>
      <SearchResults />
    </Suspense>
  );
}
