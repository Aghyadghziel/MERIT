import type { Metadata } from 'next';
import { getLocale } from '@/i18n/server';
import { AccountView } from '@/components/commerce/AccountView';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'حسابي' : 'Account',
    description: ar
      ? 'الحسابات قريب، وسلتك ومفضّلتك محفوظة في هالمتصفح.'
      : 'Accounts are coming soon. Your bag and wishlist are kept in this browser.',
    robots: { index: false, follow: true },
    alternates: { canonical: ar ? '/ar/account' : '/account', languages: { en: '/account', ar: '/ar/account' } },
  };
}

export default function AccountPage() {
  return <AccountView />;
}
