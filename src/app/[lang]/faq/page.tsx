import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { Section, TextPage } from '@/components/layout/TextPage';
import { Icon } from '@/components/ui/Icon';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'الأسئلة الشائعة' : 'Frequently asked',
    description: ar
      ? 'المقاسات والتوصيل والإرجاع والتعديلات والعناية — أكثر ما يُسأل عنه في MERIT.'
      : 'Sizing, delivery, returns, alterations and care — the questions MERIT is asked most.',
    alternates: { canonical: ar ? '/ar/faq' : '/faq', languages: { en: '/faq', ar: '/ar/faq' } },
  };
}

type Group = { id: string; title: string; items: [string, string][] };

const GROUPS: Record<'en' | 'ar', Group[]> = {
  en: [
    {
      id: 'sizing',
      title: 'Sizing and fit',
      items: [
        ['What size am I?', 'Every product page carries the measurement the garment was cut to and the height of the model in the photographs. The size guide has the full table in centimetres and inches. If you are between two sizes on a jacket, take the larger one — the shoulder is the part we cannot alter far.'],
        ['Are the trousers sized by waist?', 'Yes, in inches, measured on the garment rather than the body. A 28 has a 28-inch finished waistband.'],
        ['Do the clothes shrink?', 'Shirting is washed before cutting, so it will not. Knitwear may relax slightly with wear and returns to shape when dried flat.'],
      ],
    },
    {
      id: 'orders',
      title: 'Orders and delivery',
      items: [
        ['When will my order arrive?', 'Riyadh and Jeddah in two working days. The rest of the Gulf in three to five, free over 1,500 SAR. International in five to eight, with duties settled at checkout so nothing is owed on arrival.'],
        ['Can I change an order?', 'Until it is packed, which is usually the same afternoon. Write to us quickly and we will catch it if we can.'],
        ['Do you restock?', 'Index pieces are cut every year in the same patterns, so they return. Seasonal and runway pieces are not re-cut once the count is finished.'],
      ],
    },
    {
      id: 'returns',
      title: 'Returns',
      items: [
        ['How long do I have?', 'Thirty days from delivery, unworn and with the tag attached. Returns inside Saudi Arabia are collected at no cost.'],
        ['Can I return a sale piece?', 'Yes, on the same terms. Sale is the end of a count, not a different standard.'],
        ['How long is a refund?', 'Five to seven working days from the parcel reaching us, to the card that paid.'],
      ],
    },
    {
      id: 'care',
      title: 'Care and repair',
      items: [
        ['How should I look after tailoring?', 'Brush it, rest it on a shaped hanger for a day between wears, and clean it far less often than you think. Twice a season is plenty for a jacket.'],
        ['Do you repair?', 'Yes. Any MERIT piece can be brought or sent to the Riyadh flagship for repair at cost — reweaving, re-knitting a cuff, replacing a lining. There is no time limit.'],
        ['Do you alter?', 'Sleeves, hems and waistbands, free in the first year, at cost after that.'],
      ],
    },
  ],
  ar: [
    {
      id: 'sizing',
      title: 'المقاس والقصّة',
      items: [
        ['ما مقاسي؟', 'تذكر كل صفحة منتج القياس الذي قُصّت عليه القطعة، وطول العارضة أو العارض في الصور. ويضم دليل المقاسات الجدول الكامل بالسنتيمتر والإنش. إن كنت بين مقاسين في سترة، فاختر الأكبر — فالكتف هو الجزء الذي لا يمكننا تعديله كثيرًا.'],
        ['هل تُحدَّد مقاسات البناطيل بالخصر؟', 'نعم، بالإنش، ويُقاس على القطعة نفسها لا على الجسم. المقاس 28 يعني أن حزام الخصر النهائي 28 إنشًا.'],
        ['هل تنكمش الملابس؟', 'أقمشة القمصان تُغسل قبل القصّ، فلن تنكمش. أما التريكو فقد يرتخي قليلًا مع الارتداء، ثم يستعيد شكله حين يُجفَّف مفرودًا.'],
      ],
    },
    {
      id: 'orders',
      title: 'الطلبات والتوصيل',
      items: [
        ['متى يصل طلبي؟', 'إلى الرياض وجدة خلال يومي عمل. وإلى بقية دول الخليج خلال ثلاثة إلى خمسة أيام، والتوصيل مجاني للطلبات فوق 1,500 ر.س. والشحن الدولي خلال خمسة إلى ثمانية أيام، مع تسوية الرسوم الجمركية عند الدفع، فلا يُطلب منك شيء عند الاستلام.'],
        ['هل يمكنني تعديل طلبي؟', 'نعم، ما دام لم يُغلَّف بعد، وعادةً ما يُغلَّف بعد ظهر اليوم نفسه. راسلنا بسرعة وسنلحق به إن استطعنا.'],
        ['هل تُعيدون توفير القطع؟', 'قطع Index تُقصّ كل عام من الباترونات نفسها، لذا تعود. أما القطع الموسمية وقطع العروض فلا يُعاد قصّها بعد نفاد كميتها.'],
      ],
    },
    {
      id: 'returns',
      title: 'الإرجاع',
      items: [
        ['ما المهلة المتاحة للإرجاع؟', 'ثلاثون يومًا من تاريخ الاستلام، على أن تكون القطعة غير ملبوسة وبطاقتها مثبّتة. ونستلم المرتجعات داخل السعودية دون أي تكلفة.'],
        ['هل يمكنني إرجاع قطعة مخفّضة؟', 'نعم، بالشروط نفسها. التخفيض يعني نهاية الكمية، لا معيارًا مختلفًا.'],
        ['كم يستغرق استرداد المبلغ؟', 'من خمسة إلى سبعة أيام عمل من وصول الطرد إلينا، ويُردّ إلى البطاقة التي دُفع بها.'],
      ],
    },
    {
      id: 'care',
      title: 'العناية والإصلاح',
      items: [
        ['كيف أعتني بالقطع المفصّلة؟', 'مرّر عليها الفرشاة، وعلّقها يومًا على علّاقة مشكَّلة بين كل ارتداء وآخر، ونظّفها أقل بكثير مما تظن. مرتان في الموسم تكفيان للسترة.'],
        ['هل تُصلحون القطع؟', 'نعم. يمكن إحضار أي قطعة من MERIT أو إرسالها إلى المتجر الرئيسي في الرياض لإصلاحها بسعر التكلفة — رتق النسيج، أو إعادة حياكة طرف الكُمّ، أو استبدال البطانة. ولا حدّ زمنيًا لذلك.'],
        ['هل تُجرون تعديلات على المقاس؟', 'الأكمام والحواشي وأحزمة الخصر، مجانًا في السنة الأولى، وبسعر التكلفة بعد ذلك.'],
      ],
    },
  ],
};

/**
 * A native <details> accordion, so it works before the script arrives and
 * with no script at all. Where the browser can animate to `auto` it opens on
 * the house ease; elsewhere it simply opens.
 */
const DETAILS = [
  'group border-b border-line [interpolate-size:allow-keywords]',
  '[&::details-content]:h-0 [&::details-content]:overflow-hidden',
  '[&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-500',
  '[&::details-content]:ease-(--ease-out) [&::details-content]:[transition-behavior:allow-discrete]',
  'open:[&::details-content]:h-auto',
].join(' ');

const pad = (n: number) => String(n).padStart(2, '0');

export default async function FaqPage() {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const groups = GROUPS[locale];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: ar ? 'ar' : 'en',
    mainEntity: groups.flatMap((g) =>
      g.items.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    ),
  };

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TextPage
        eyebrow={ar ? 'خدمة العملاء' : 'Client care'}
        title={ar ? 'الأسئلة الشائعة.' : 'Frequently asked.'}
        standfirst={ar
          ? `أكثر ${total} سؤالًا تُطرح علينا، في أربع مجموعات. إن لم تجد سؤالك هنا، راسلنا.`
          : `The ${total} questions we are asked most, in four groups. If yours is not here, write to us.`}
        toc={groups.map((g) => ({ id: g.id, label: g.title }))}
        aside={
          <div className="border-t border-ink pt-5 lg:border-line">
            <p className="text-[clamp(1.125rem,1rem+0.4vw,1.3125rem)] font-semibold leading-tight tracking-[-0.02em]">
              {ar ? 'لم تجد سؤالك؟' : 'Not here?'}
            </p>
            <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-mute">
              {ar
                ? 'شخص واحد يقرأ كل ما يُرسَل إلى خدمة العملاء، ويردّ خلال يوم عمل.'
                : 'One person reads everything sent to client care and answers within a working day.'}
            </p>
            <Link href="/contact" className="label group mt-4 inline-flex min-h-11 items-center gap-2">
              {ar ? 'اسألنا مباشرة' : 'Ask us directly'}
              <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        }
        asideLast
      >
        {groups.map((g) => (
          <Section key={g.id} id={g.id} title={g.title} plain>
            <div className="border-t border-ink">
              {g.items.map(([q, a], i) => (
                <details key={q} className={DETAILS}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-start gap-4 py-5 md:gap-6 md:py-6 [&::-webkit-details-marker]:hidden">
                    <span className="label-sm nums mt-[0.55em] w-6 shrink-0 text-mute">{pad(i + 1)}</span>
                    <span className="flex-1 text-[clamp(1.0625rem,0.95rem+0.5vw,1.375rem)] font-medium leading-[1.28] tracking-[-0.02em] transition-transform duration-500 ease-(--ease-out) md:group-hover:translate-x-1 rtl:md:group-hover:-translate-x-1">
                      {q}
                    </span>
                    <span aria-hidden className="relative mt-[0.4em] size-4 shrink-0">
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="max-w-[60ch] pb-7 ps-10 pe-6 text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.7] text-ink-3 md:ps-12 md:pe-12">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </Section>
        ))}
      </TextPage>
    </>
  );
}
