import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { CartDrawer } from '@/components/overlays/CartDrawer';
import { MobileNav } from '@/components/overlays/MobileNav';
import { SearchOverlay } from '@/components/overlays/SearchOverlay';
import { Cursor } from '@/components/providers/Cursor';
import { MotionRoot } from '@/components/providers/Motion';
import { StoreProvider } from '@/components/providers/Store';
import { UiProvider } from '@/components/providers/Ui';
import { BRAND } from '@/lib/brand';
import { arabicDisplayStack, arabicEditorialStack, arabicHeadStack, arabicStack, fontVariables } from '@/lib/fonts';
import { LocaleProvider } from '@/i18n/client';
import { dirOf, LOCALES } from '@/i18n/config';
import { getLocale, getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
  metadataBase: new URL(BRAND.domain),
  title: {
    default: ar ? `${BRAND.name} — أزياء معاصرة من الرياض` : `${BRAND.name} — Contemporary fashion, Riyadh`,
    template: `%s — ${BRAND.name}`,
  },
  description: ar
    ? 'ميرت علامة أزياء معاصرة من الرياض. تفصيل ومعاطف وتريكو نسوّيها بكميات قليلة ونبيعها مباشرة.'
    : 'MERIT is a contemporary fashion label based in Riyadh. Tailoring, outerwear and knitwear made in small counts, sold directly.',
  applicationName: BRAND.name,
  alternates: { canonical: ar ? '/ar' : '/', languages: { en: '/', ar: '/ar' } },
  icons: {
    icon: [
      { url: '/brand/icon.svg', type: 'image/svg+xml' },
      { url: '/brand/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    // iOS ignores SVG touch icons; this is the same mark rendered at 180px.
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: ar ? `${BRAND.name} — أزياء معاصرة من الرياض` : `${BRAND.name} — Contemporary fashion, Riyadh`,
    description: ar
      ? 'تفصيل ومعاطف وتريكو بكميات قليلة، مباشرة من الرياض.'
      : 'Tailoring, outerwear and knitwear made in small counts, sold directly from Riyadh.',
    url: ar ? '/ar' : '/',
    locale: ar ? 'ar_SA' : 'en_SA',
    images: [{ url: '/img/campaign-rule-line-wide.webp', width: 2560, height: 1440, alt: ar ? 'ميرت خريف وشتاء 2026' : 'MERIT Autumn Winter 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: ar ? `${BRAND.name} — أزياء معاصرة من الرياض` : `${BRAND.name} — Contemporary fashion, Riyadh`,
    description: ar ? 'تفصيل ومعاطف وتريكو بكميات قليلة.' : 'Tailoring, outerwear and knitwear made in small counts.',
    images: ['/img/campaign-rule-line-wide.webp'],
  },
  robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#f8f6ef',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Reveal-on-scroll hides its elements in CSS. If scripting is off, nothing
 * will ever un-hide them, so put them all back.
 */
const NO_SCRIPT = `[data-reveal],[data-reveal-img]>*,[data-reveal-line]>span>span{opacity:1!important;clip-path:none!important;transform:none!important}`;

const ORGANISATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.name,
  legalName: BRAND.legal,
  url: BRAND.domain,
  logo: `${BRAND.domain}/brand/icon.svg`,
  foundingDate: String(BRAND.founded),
  email: BRAND.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: BRAND.city,
    addressCountry: 'SA',
  },
  // No sameAs: a concept brand owns no social accounts to point at.
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
// No `dynamicParams = false` here or on the slug pages: this layout is the
// root, so a param outside the list would 404 before any layout renders and
// fall back to Next's bare error page. Unknown paths render on demand and call
// notFound() instead, which shows the house 404 in the right language. The
// proxy only ever hands this segment 'en' or 'ar'.

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getT();
  return (
    // data-scroll-behavior tells Next to switch the smooth scrolling in
    // globals.css off while it resets the scroll on a route change; without
    // it, the reset animates and a new page can land part-way down.
    <html lang={locale} dir={dirOf(locale)} className={fontVariables} data-scroll-behavior="smooth"
      style={locale === 'ar' ? ({
        '--font-ar-stack': arabicStack,
        '--font-ar-display-stack': arabicDisplayStack,
        '--font-ar-head-stack': arabicHeadStack,
        '--font-ar-editorial-stack': arabicEditorialStack,
      } as React.CSSProperties) : undefined}>
      <head>
        <noscript><style dangerouslySetInnerHTML={{ __html: NO_SCRIPT }} /></noscript>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION) }}
        />
        <a className="skip-link" href="#main">{t('Skip to content')}</a>
        <LocaleProvider locale={locale}>
        <StoreProvider>
          <UiProvider>
            <MotionRoot />
            <Cursor />
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <SearchOverlay />
            <CartDrawer />
            <MobileNav />
          </UiProvider>
        </StoreProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
