import type { Metadata } from 'next';
import { CartView } from '@/components/commerce/CartView';

export const metadata: Metadata = {
  title: 'Shopping bag',
  description: 'Your MERIT shopping bag.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/cart' },
};

export default function CartPage() {
  return <CartView />;
}
