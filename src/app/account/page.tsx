import type { Metadata } from 'next';
import { AccountView } from '@/components/commerce/AccountView';

export const metadata: Metadata = {
  title: 'Account',
  description: 'MERIT is a concept site: accounts are not connected, and your bag and wishlist are kept in this browser.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/account' },
};

export default function AccountPage() {
  return <AccountView />;
}
