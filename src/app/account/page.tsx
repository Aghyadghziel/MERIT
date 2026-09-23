import type { Metadata } from 'next';
import { AccountView } from '@/components/commerce/AccountView';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sign in to your MERIT account.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/account' },
};

export default function AccountPage() {
  return <AccountView />;
}
