import type { Metadata } from 'next';
import Link from 'next/link';
import { TextPage } from '@/components/layout/TextPage';
import { Icon } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Frequently asked',
  description: 'Sizing, delivery, returns, alterations and care — the questions MERIT is asked most.',
  alternates: { canonical: '/faq' },
};

const GROUPS = [
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
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TextPage
        eyebrow="Client care"
        title="Frequently asked."
        aside={
          <nav aria-label="Sections" className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <ul className="space-y-2.5">
              {GROUPS.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="label-sm link-rule text-mute">{g.title}</a>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="label link-rule mt-8 inline-block">Ask us directly</Link>
          </nav>
        }
      >
        {GROUPS.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-32 border-t border-line pt-8 first:border-0 first:pt-0 [&+section]:mt-10">
            <h2 className="display-sm" data-reveal>{g.title}</h2>
            <div className="mt-5">
              {g.items.map(([q, a]) => (
                <details key={q} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-sm [&::-webkit-details-marker]:hidden">
                    {q}
                    <Icon name="plus" className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45" />
                  </summary>
                  <p className="pb-5 pr-10 text-sm leading-relaxed text-mute">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </TextPage>
    </>
  );
}
