import type { Metadata } from 'next';
import { getLocale } from '@/i18n/server';
import { CartView } from '@/components/commerce/CartView';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'حقيبة التسوق' : 'Shopping bag',
    description: ar
      ? 'حقيبة تسوّقك في MERIT.'
      : 'Your MERIT shopping bag.',
    robots: { index: false, follow: true },
    alternates: { canonical: ar ? '/ar/cart' : '/cart', languages: { en: '/cart', ar: '/ar/cart' } },
  };
}

export default function CartPage() {
  return <CartView />;
}
