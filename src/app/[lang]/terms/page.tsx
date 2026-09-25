import type { Metadata } from 'next';
import { Section, TextPage } from '@/components/layout/TextPage';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'شروط البيع' : 'Terms of sale',
    description: ar ? 'شروط الشراء من ميرت.' : 'The terms for buying from MERIT.',
    alternates: { canonical: ar ? '/ar/terms' : '/terms', languages: { en: '/terms', ar: '/ar/terms' } },
  };
}

const IDS = ['company', 'products', 'orders', 'law', 'content'] as const;

/**
 * The terms in each language, section by section, in the order of IDS. Each
 * section is a list of paragraphs.
 */
const COPY = {
  en: {
    eyebrow: 'Legal',
    title: 'Terms of sale.',
    standfirst: 'The terms for buying from MERIT. Online payment is coming soon; until then, orders are arranged with us directly by email or Instagram.',
    sections: [
      {
        title: 'The company',
        body: [
          'MERIT is a fashion label from Riyadh, Saudi Arabia. You can reach us at themeritbrand@gmail.com.',
        ],
      },
      {
        title: 'Products and prices',
        body: [
          'Prices are shown in Saudi riyals. Other currencies are converted at a fixed indicative rate and are not live; the price in riyals is the one that applies.',
        ],
      },
      {
        title: 'Orders',
        body: [
          'Online payment is coming soon. Until then, to order a piece, email themeritbrand@gmail.com or message @meritbrands on Instagram, and we will confirm availability, price and delivery with you before anything is paid.',
        ],
      },
      {
        title: 'Law and returns',
        body: [
          'These terms are governed by the laws of the Kingdom of Saudi Arabia. Returns follow the periods set out on the shipping and returns page.',
        ],
      },
      {
        title: 'Content',
        body: [
          'The design, code, wordmark and written copy on this site were made for MERIT. Some photographs are from Unsplash, used under the Unsplash Licence.',
        ],
      },
    ],
  },
  ar: {
    eyebrow: 'الشؤون القانونية',
    title: 'شروط البيع.',
    standfirst: 'شروط الشراء من ميرت. الدفع الإلكتروني قريبًا، وحتى ذلك الحين تُرتَّب الطلبات معنا مباشرةً عبر البريد الإلكتروني أو إنستغرام.',
    sections: [
      {
        title: 'الشركة',
        body: [
          'ميرت (MERIT) علامة أزياء من الرياض في المملكة العربية السعودية. يمكنك مراسلتنا على themeritbrand@gmail.com.',
        ],
      },
      {
        title: 'المنتجات والأسعار',
        body: [
          'تُعرض الأسعار بالريال السعودي، وتُحوَّل العملات الأخرى بسعر صرف استرشادي ثابت لا يُحدَّث لحظيًا، والسعر المعتمد هو السعر بالريال.',
        ],
      },
      {
        title: 'الطلبات',
        body: [
          'الدفع الإلكتروني قريبًا. وحتى ذلك الحين، لطلب أي قطعة راسلنا على themeritbrand@gmail.com أو على حساب ‎@meritbrands في إنستغرام، وسنؤكد معك التوفر والسعر والتوصيل قبل دفع أي مبلغ.',
        ],
      },
      {
        title: 'الأنظمة والإرجاع',
        body: [
          'تخضع هذه الشروط لأنظمة المملكة العربية السعودية، ويتم الإرجاع خلال المُدد المذكورة في صفحة الشحن والإرجاع.',
        ],
      },
      {
        title: 'المحتوى',
        body: [
          'التصميم والشيفرة البرمجية والشعار النصي والنصوص المكتوبة في هذا الموقع أُعدّت خصيصًا لميرت. وبعض الصور من Unsplash، مستخدمة بموجب ترخيص Unsplash.',
        ],
      },
    ],
  },
};

export default async function TermsPage() {
  const c = COPY[await getLocale()];
  return (
    <TextPage
      eyebrow={c.eyebrow}
      title={c.title}
      standfirst={c.standfirst}
      toc={IDS.map((id, n) => ({ id, label: c.sections[n].title }))}
    >
      {c.sections.map((s, n) => (
        <Section key={IDS[n]} id={IDS[n]} title={s.title}>
          {s.body.map((p) => <p key={p}>{p}</p>)}
        </Section>
      ))}
    </TextPage>
  );
}
