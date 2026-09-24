import type { Metadata } from 'next';
import { WishlistView } from '@/components/commerce/WishlistView';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'The MERIT pieces you have saved, kept in this browser.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/wishlist' },
};

export default function WishlistPage() {
  return <WishlistView />;
}
