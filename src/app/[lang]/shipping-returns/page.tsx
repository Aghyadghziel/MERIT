import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { Section, TextPage } from '@/components/layout/TextPage';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'الشحن والإرجاع' : 'Shipping and returns',
    description: ar
      ? 'مُدد التوصيل وتكاليفه داخل السعودية ودول الخليج وبقية العالم، وطريقة الإرجاع في MERIT.'
      : 'Delivery times and costs for Saudi Arabia, the Gulf and the rest of the world, and how MERIT returns work.',
    alternates: {
      canonical: ar ? '/ar/shipping-returns' : '/shipping-returns',
      languages: { en: '/shipping-returns', ar: '/ar/shipping-returns' },
    },
  };
}

type Rate = { where: string; time: string; cost: string; else: string };

/** Every figure is the same in both languages; only the words change. */
const RATES: Record<'en' | 'ar', Rate[]> = {
  en: [
    { where: 'Riyadh and Jeddah', time: '2 working days', cost: 'Free over 1,500 SAR', else: 'Otherwise 35 SAR' },
    { where: 'Rest of Saudi Arabia', time: '2–3 working days', cost: 'Free over 1,500 SAR', else: 'Otherwise 45 SAR' },
    { where: 'GCC', time: '3–5 working days', cost: 'Free over 1,500 SAR', else: 'Otherwise 90 SAR' },
    { where: 'Europe and UK', time: '5–8 working days', cost: '120 SAR', else: 'Duties settled at checkout' },
    { where: 'Rest of world', time: '5–10 working days', cost: '160 SAR', else: 'Duties settled at checkout' },
  ],
  ar: [
    { where: 'الرياض وجدة', time: 'يوما عمل', cost: 'مجاني فوق 1,500 ر.س', else: 'وإلا 35 ر.س' },
    { where: 'بقية مناطق السعودية', time: 'من 2 إلى 3 أيام عمل', cost: 'مجاني فوق 1,500 ر.س', else: 'وإلا 45 ر.س' },
    { where: 'دول الخليج', time: 'من 3 إلى 5 أيام عمل', cost: 'مجاني فوق 1,500 ر.س', else: 'وإلا 90 ر.س' },
    { where: 'أوروبا والمملكة المتحدة', time: 'من 5 إلى 8 أيام عمل', cost: '120 ر.س', else: 'تُسوّى الرسوم الجمركية عند الدفع' },
    { where: 'بقية العالم', time: 'من 5 إلى 10 أيام عمل', cost: '160 ر.س', else: 'تُسوّى الرسوم الجمركية عند الدفع' },
  ],
};

const COPY = {
  en: {
    eyebrow: 'Client care',
    title: 'Shipping and returns.',
    standfirst: 'Parcels travel in cotton and board, never plastic, and international duties are settled at checkout, so nothing is owed at the door.',
    facts: [
      { label: 'Packed the same day', value: '14:00', unit: 'AST', note: 'Order before, Sunday to Thursday.' },
      { label: 'To return', value: '30', unit: 'days', note: 'Collected free inside Saudi Arabia.' },
      { label: 'Free delivery', value: '1,500', unit: 'SAR', note: 'Over this, in Saudi Arabia and the GCC.' },
      { label: 'Refund', value: '5–7', unit: 'days', note: 'Working days, to the card that paid.' },
    ],
    toc: ['Delivery', 'Returns', 'Exchanges', 'Alterations and repairs', 'Packaging', 'Questions'],
    caption: 'Delivery times and costs by destination',
    head: ['Destination', 'Time', 'Cost'],
  },
  ar: {
    eyebrow: 'خدمة العملاء',
    title: 'الشحن والإرجاع.',
    standfirst: 'تُشحن الطرود في أكياس قطنية وعلب كرتونية، لا في البلاستيك أبدًا، وتُسوّى الرسوم الجمركية الدولية عند الدفع، فلا يُطلب منك شيء عند الباب.',
    facts: [
      { label: 'التغليف في اليوم نفسه', value: '14:00', note: 'للطلبات قبل هذا الوقت بتوقيت السعودية، من الأحد إلى الخميس.' },
      { label: 'مهلة الإرجاع', value: '30', unit: 'يومًا', note: 'الاستلام مجاني داخل السعودية.' },
      { label: 'التوصيل المجاني', value: '1,500', unit: 'ر.س', note: 'للطلبات التي تتجاوز هذا المبلغ، داخل السعودية ودول الخليج.' },
      { label: 'استرداد المبلغ', value: '5–7', unit: 'أيام', note: 'أيام عمل، إلى البطاقة التي دُفع بها.' },
    ],
    toc: ['التوصيل', 'الإرجاع', 'الاستبدال', 'التعديلات والإصلاح', 'التغليف', 'استفسارات'],
    caption: 'مُدد التوصيل وتكاليفه حسب الوجهة',
    head: ['الوجهة', 'المدة', 'التكلفة'],
  },
};

const IDS = ['delivery', 'returns', 'exchanges', 'alterations', 'packaging', 'questions'] as const;

export default async function ShippingPage() {
  const locale = await getLocale();
  const c = COPY[locale];
  const title = (n: number) => c.toc[n];
  return (
    <TextPage
      eyebrow={c.eyebrow}
      title={c.title}
      standfirst={c.standfirst}
      facts={c.facts}
      toc={IDS.map((id, n) => ({ id, label: c.toc[n] }))}
    >
      <Section id="delivery" title={title(0)} plain>
        <table className="w-full table-fixed border-collapse text-start">
          <caption className="sr-only">{c.caption}</caption>
          <colgroup>
            <col className="w-[38%] md:w-[36%]" />
            <col className="w-[28%] md:w-[26%]" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-y border-ink">
              {c.head.map((h) => (
                <th key={h} scope="col" className="label-sm py-3.5 pe-3 text-start font-semibold text-mute md:pe-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATES[locale].map((r) => (
              <tr key={r.where} className="border-b border-line align-top">
                <th scope="row" className="py-5 pe-3 text-start text-[clamp(0.9375rem,0.85rem+0.45vw,1.25rem)] font-semibold leading-tight tracking-[-0.02em] md:pe-6">
                  {r.where}
                </th>
                <td className="nums py-5 pe-3 text-sm leading-snug text-ink-3 md:pe-6 md:text-[0.9375rem]">{r.time}</td>
                <td className="py-5 text-sm leading-snug md:text-[0.9375rem]">
                  <span className="nums block font-medium">{r.cost}</span>
                  <span className="nums mt-1 block text-mute">{r.else}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {locale === 'ar' ? (
        <>
          <Section id="returns" title={title(1)}>
            <p>
              ثلاثون يومًا من تاريخ الاستلام. يجب أن تكون القطع غير ملبوسة، وبطاقتها مثبّتة، وفي العلبة
              التي وصلت فيها. نستلم المرتجعات داخل السعودية من العنوان الذي تختاره دون أي تكلفة؛ راسل
              خدمة العملاء ويُحجز لك مندوب شحن خلال يوم.
            </p>
            <p>
              يُردّ المبلغ إلى البطاقة التي دُفع بها، خلال خمسة إلى سبعة أيام عمل من وصول الطرد إلى
              الاستوديو. ولا تُردّ رسوم التوصيل الأصلية إلا عند إرجاع الطلب بأكمله.
            </p>
          </Section>

          <Section id="exchanges" title={title(2)}>
            <p>
              لا نُجري الاستبدال كعملية منفصلة — أرجع القطعة وقدّم طلبًا جديدًا، حتى يُحجز لك المقاس الذي
              تريده فورًا بدل أن تنتظر وصول الطرد.
            </p>
          </Section>

          <Section id="alterations" title={title(3)}>
            <p>
              تُعدَّل الأكمام والحواشي وأحزمة الخصر مجانًا خلال السنة الأولى من الشراء، وبسعر التكلفة بعد
              ذلك. ويمكن إرسال أي قطعة من MERIT لإصلاحها في أي وقت من عمرها. ولا يمكن إرجاع القطع المعدَّلة.
            </p>
          </Section>

          <Section id="packaging" title={title(4)}>
            <p>
              تُشحن القطع في أكياس قطنية غير مبيَّضة داخل علبة من الكرتون المعاد تدويره، مغلقة بشريط ورقي.
              لا بلاستيك في الطرد ولا فاتورة مطبوعة — تُرسَل الفاتورة بالبريد الإلكتروني بدلًا من ذلك.
            </p>
          </Section>

          <Section id="questions" title={title(5)}>
            <p>
              <Link href="/contact" className="link-rule">راسل خدمة العملاء</Link> وسيردّ عليك شخص واحد
              خلال يوم عمل.
            </p>
          </Section>
        </>
      ) : (
        <>
          <Section id="returns" title={title(1)}>
            <p>
              Thirty days from delivery. Pieces must be unworn, with the tag attached and in the box they
              arrived in. Returns inside Saudi Arabia are collected from an address of your choosing at no
              cost; write to client care and a courier is booked within a day.
            </p>
            <p>
              Refunds are issued to the card that paid, five to seven working days from the parcel reaching
              the studio. Original delivery charges are refunded only where the whole order is returned.
            </p>
          </Section>

          <Section id="exchanges" title={title(2)}>
            <p>
              We do not process exchanges as a separate transaction — return the piece and place a new order,
              so the size you want is held for you immediately rather than after the parcel arrives.
            </p>
          </Section>

          <Section id="alterations" title={title(3)}>
            <p>
              Sleeves, hems and waistbands are altered free within the first year of purchase and at cost
              after that. Any MERIT piece can be sent back for repair at any point in its life. Altered
              pieces cannot be returned.
            </p>
          </Section>

          <Section id="packaging" title={title(4)}>
            <p>
              Garments travel in unbleached cotton bags inside a recycled board box, closed with paper tape.
              There is no plastic in the parcel and no printed invoice — it is emailed instead.
            </p>
          </Section>

          <Section id="questions" title={title(5)}>
            <p>
              <Link href="/contact" className="link-rule">Write to client care</Link> and one person will
              answer within a working day.
            </p>
          </Section>
        </>
      )}
    </TextPage>
  );
}
