import type { Metadata } from 'next';
import { Section, TextPage } from '@/components/layout/TextPage';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'شروط البيع' : 'Terms of sale',
    description: ar ? 'الشروط التي كانت ستحكم أي طلب من MERIT.' : 'The terms that would govern a MERIT order.',
    alternates: { canonical: ar ? '/ar/terms' : '/terms', languages: { en: '/terms', ar: '/ar/terms' } },
  };
}

const IDS = ['company', 'products', 'orders', 'real', 'content'] as const;

/**
 * The terms in each language, section by section, in the order of IDS. Each
 * section is a list of paragraphs.
 */
const COPY = {
  en: {
    eyebrow: 'Legal',
    title: 'Terms of sale.',
    standfirst: 'MERIT is a fictional label built as a demonstration. Nothing here can be bought, so nothing below creates an obligation on anyone.',
    sections: [
      {
        title: 'The company',
        body: [
          'MERIT and Merit Atelier are invented names. There is no registered company, no commercial registration number and no VAT registration behind this site. Any resemblance to a real label is unintended.',
        ],
      },
      {
        title: 'Products and prices',
        body: [
          'Every garment, material, mill, count, stock level and price shown is invented for the purposes of the demonstration. Prices are displayed in Saudi riyals; other currencies are converted at a fixed indicative rate and are not live.',
        ],
      },
      {
        title: 'Orders',
        body: [
          'The checkout is deliberately not connected to a payment processor. No order can be placed, no card can be charged and nothing will be shipped.',
        ],
      },
      {
        title: 'What a real version would say',
        body: [
          'A live MERIT would form a contract at the point of dispatch rather than payment, would be governed by the laws of the Kingdom of Saudi Arabia, and would set out the statutory right to return within the periods stated in the shipping and returns page.',
          'This paragraph stands in for that text.',
        ],
      },
      {
        title: 'Content',
        body: [
          'The design, code, wordmark and written copy on this site were made for it. The photography is placeholder material from Unsplash, used under the Unsplash Licence and credited in the repository.',
        ],
      },
    ],
  },
  ar: {
    eyebrow: 'الشؤون القانونية',
    title: 'شروط البيع.',
    standfirst: 'MERIT علامة خيالية بُنيت للعرض والتوضيح. لا يمكن شراء أي شيء هنا، ولذلك لا يُنشئ أيٌّ مما يلي التزامًا على أحد.',
    sections: [
      {
        title: 'الشركة',
        body: [
          'MERIT وMerit Atelier اسمان مُختلَقان. لا توجد خلف هذا الموقع شركة مسجّلة، ولا رقم سجل تجاري، ولا تسجيل في ضريبة القيمة المضافة. وأي تشابه مع علامة حقيقية غير مقصود.',
        ],
      },
      {
        title: 'المنتجات والأسعار',
        body: [
          'كل قطعة وخامة ومصنع وكمية ومستوى مخزون وسعر معروض هنا مُختلَق لأغراض العرض. تُعرض الأسعار بالريال السعودي، وتُحوَّل العملات الأخرى بسعر صرف استرشادي ثابت لا يُحدَّث لحظيًا.',
        ],
      },
      {
        title: 'الطلبات',
        body: [
          'صفحة الدفع غير مربوطة بأي مزوّد لخدمات الدفع، وذلك عن قصد. لا يمكن تقديم أي طلب، ولا خصم أي مبلغ من أي بطاقة، ولن يُشحن أي شيء.',
        ],
      },
      {
        title: 'ما كانت ستقوله النسخة الحقيقية',
        body: [
          'كانت النسخة الحقيقية من MERIT ستُبرم العقد عند شحن الطلب لا عند الدفع، وستخضع لأنظمة المملكة العربية السعودية، وستنصّ على الحق النظامي في الإرجاع خلال المُدد المذكورة في صفحة الشحن والإرجاع.',
          'تقوم هذه الفقرة مقام ذلك النص.',
        ],
      },
      {
        title: 'المحتوى',
        body: [
          'التصميم والشيفرة البرمجية والشعار النصي والنصوص المكتوبة في هذا الموقع أُعدّت خصيصًا له. أما الصور فمواد مؤقتة من Unsplash، مستخدمة بموجب ترخيص Unsplash ومنسوبة إلى أصحابها في المستودع.',
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
