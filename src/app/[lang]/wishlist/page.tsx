import type { Metadata } from 'next';
import { getLocale } from '@/i18n/server';
import { WishlistView } from '@/components/commerce/WishlistView';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'المفضّلة' : 'Wishlist',
    description: ar
      ? 'قطع ميرت اللي حفظتها، محفوظة في هالمتصفح.'
      : 'The MERIT pieces you have saved, kept in this browser.',
    robots: { index: false, follow: true },
    alternates: { canonical: ar ? '/ar/wishlist' : '/wishlist', languages: { en: '/wishlist', ar: '/ar/wishlist' } },
  };
}

export default function WishlistPage() {
  return <WishlistView />;
}
