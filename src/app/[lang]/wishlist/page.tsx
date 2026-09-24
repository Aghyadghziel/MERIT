import type { Metadata } from 'next';
import { getLocale } from '@/i18n/server';
import { WishlistView } from '@/components/commerce/WishlistView';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'قائمة الأمنيات' : 'Wishlist',
    description: ar
      ? 'قطع ميرت التي حفظتها، محفوظة في هذا المتصفح.'
      : 'The MERIT pieces you have saved, kept in this browser.',
    robots: { index: false, follow: true },
    alternates: { canonical: ar ? '/ar/wishlist' : '/wishlist', languages: { en: '/wishlist', ar: '/ar/wishlist' } },
  };
}

export default function WishlistPage() {
  return <WishlistView />;
}
