import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { Section, TextPage } from '@/components/layout/TextPage';
import { Icon } from '@/components/ui/Icon';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'أسئلة تتكرر' : 'Frequently asked',
    description: ar
      ? 'المقاسات والتوصيل والإرجاع والتعديل والعناية — أكثر شي ينسألنا عنه في ميرت.'
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
      title: 'المقاس والقَصّة',
      items: [
        ['وش مقاسي؟', 'كل صفحة قطعة مكتوب فيها المقاس اللي انقصّت عليه، وطول المودل اللي في الصور. ودليل المقاسات فيه الجدول كامل بالسنتي والإنش. إذا كنت بين مقاسين في جاكيت، خذ الأكبر — لأن الكتف هو الشي اللي ما نقدر نعدّل فيه كثير.'],
        ['مقاسات البناطيل حسب الخصر؟', 'إيه، بالإنش، ونقيسه على القطعة نفسها مو على الجسم. مقاس 28 يعني الحزام بعد ما يخلص 28 إنش.'],
        ['الملابس تنكمش؟', 'أقمشة القمصان نغسلها قبل ما نقصّها، فما راح تنكمش. أما التريكو ممكن يرتخي شوي مع اللبس، وبعدين يرجع لشكله إذا نشّفته مفرود.'],
      ],
    },
    {
      id: 'orders',
      title: 'الطلبات والتوصيل',
      items: [
        ['متى يوصل طلبي؟', 'الرياض وجدة خلال يومين عمل. وباقي دول الخليج من ثلاثة لخمسة أيام، والتوصيل ببلاش للطلبات فوق 1,500 ر.س. والشحن الدولي من خمسة لثمانية أيام، والجمارك تندفع وقت الطلب، فما أحد يطلب منك شي وقت الاستلام.'],
        ['أقدر أعدّل طلبي؟', 'إيه، دامه ما تغلّف، وعادة نغلّفه عصر نفس اليوم. راسلنا بسرعة ونلحقه إذا قدرنا.'],
        ['ترجّعون القطع اللي تخلص؟', 'قطع الفهرس نقصّها كل سنة من نفس الباترونات، فترجع. أما القطع الموسمية وقطع العروض فإذا خلصت ما نعيد قصّها.'],
      ],
    },
    {
      id: 'returns',
      title: 'الإرجاع',
      items: [
        ['كم مدة الإرجاع؟', 'ثلاثين يوم من يوم ما استلمت، بشرط القطعة ما تنلبس والتاق فيها. وداخل السعودية نستلم المرتجع منك ببلاش.'],
        ['أقدر أرجّع قطعة عليها تخفيض؟', 'إيه، بنفس الشروط. التخفيض يعني إن الكمية قاربت تخلص، مو إن القطعة أقل.'],
        ['متى ترجع فلوسي؟', 'من خمسة لسبعة أيام عمل من وصول الطرد لنا، وترجع على نفس البطاقة اللي دفعت فيها.'],
      ],
    },
    {
      id: 'care',
      title: 'العناية والتصليح',
      items: [
        ['كيف أهتم بالقطع المفصّلة؟', 'فرّشها، وعلّقها يوم على علّاقة مشكّلة بين كل لبسة والثانية، ونظّفها أقل بكثير مما تتوقع. مرتين في الموسم تكفي للجاكيت.'],
        ['تصلّحون القطع؟', 'إيه. جيب أي قطعة من ميرت أو أرسلها للفرع الرئيسي في الرياض ونصلّحها بسعر التكلفة — رتق القماش، أو نعيد حياكة طرف الكم، أو نبدّل البطانة. وما لها وقت محدد.'],
        ['تعدّلون المقاس؟', 'الأكمام والأطراف والأحزمة، ببلاش أول سنة، وبعدها بسعر التكلفة.'],
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
        title={ar ? 'أسئلة تتكرر.' : 'Frequently asked.'}
        standfirst={ar
          ? `أكثر ${total} سؤال ينسألنا، في أربع أقسام. ما لقيت سؤالك؟ راسلنا.`
          : `The ${total} questions we are asked most, in four groups. If yours is not here, write to us.`}
        toc={groups.map((g) => ({ id: g.id, label: g.title }))}
        aside={
          <div className="border-t border-ink pt-5 lg:border-line">
            <p className="text-[clamp(1.125rem,1rem+0.4vw,1.3125rem)] font-semibold leading-tight tracking-[-0.02em]">
              {ar ? 'ما لقيت سؤالك؟' : 'Not here?'}
            </p>
            <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-mute">
              {ar
                ? 'شخص واحد يقرأ كل شي يوصل لخدمة العملاء، ويرد خلال يوم عمل.'
                : 'One person reads everything sent to client care and answers within a working day.'}
            </p>
            <Link href="/contact" className="label group mt-4 inline-flex min-h-11 items-center gap-2">
              {ar ? 'اسألنا على طول' : 'Ask us directly'}
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
