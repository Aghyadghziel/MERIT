import type { Metadata } from 'next';
import { getLocale } from '@/i18n/server';
import { AccountView } from '@/components/commerce/AccountView';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'الحساب' : 'Account',
    description: ar
      ? 'MERIT موقع تصوّري: الحسابات غير مفعّلة، وتُحفظ حقيبتك وقائمة أمنياتك في هذا المتصفح.'
      : 'MERIT is a concept site: accounts are not connected, and your bag and wishlist are kept in this browser.',
    robots: { index: false, follow: true },
    alternates: { canonical: ar ? '/ar/account' : '/account', languages: { en: '/account', ar: '/ar/account' } },
  };
}

export default function AccountPage() {
  return <AccountView />;
}
