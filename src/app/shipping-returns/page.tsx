import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, TextPage } from '@/components/layout/TextPage';

export const metadata: Metadata = {
  title: 'Shipping and returns',
  description: 'Delivery times and costs for Saudi Arabia, the Gulf and the rest of the world, and how MERIT returns work.',
  alternates: { canonical: '/shipping-returns' },
};

const RATES = [
  ['Riyadh and Jeddah', '2 working days', 'Free over 1,500 SAR, otherwise 35 SAR'],
  ['Rest of Saudi Arabia', '2–3 working days', 'Free over 1,500 SAR, otherwise 45 SAR'],
  ['GCC', '3–5 working days', 'Free over 1,500 SAR, otherwise 90 SAR'],
  ['Europe and UK', '5–8 working days', '120 SAR, duties settled at checkout'],
  ['Rest of world', '5–10 working days', '160 SAR, duties settled at checkout'],
];

export default function ShippingPage() {
  return (
    <TextPage
      eyebrow="Client care"
      title="Shipping and returns."
      standfirst="Orders placed before 14:00 AST are packed the same day, Sunday to Thursday."
    >
      <section className="pb-2">
        <h2 className="display-sm">Delivery</h2>
        <div className="no-bar mt-5 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr>
                {['Destination', 'Time', 'Cost'].map((h) => (
                  <th key={h} scope="col" className="label-sm border-b border-line py-3 pr-6 text-left text-mute">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATES.map((r) => (
                <tr key={r[0]}>
                  <td className="border-b border-line py-3 pr-6">{r[0]}</td>
                  <td className="nums border-b border-line py-3 pr-6 text-mute">{r[1]}</td>
                  <td className="border-b border-line py-3 pr-6 text-mute">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10">
        <Section title="Returns">
          <p>
            Thirty days from delivery. Pieces must be unworn, with the tag attached and in the box
            they arrived in. Returns inside Saudi Arabia are collected from an address of your
            choosing at no cost; write to client care and a courier is booked within a day.
          </p>
          <p>
            Refunds are issued to the card that paid, five to seven working days from the parcel
            reaching the studio. Original delivery charges are refunded only where the whole order
            is returned.
          </p>
        </Section>

        <Section title="Exchanges">
          <p>
            We do not process exchanges as a separate transaction — return the piece and place a new
            order, so the size you want is held for you immediately rather than after the parcel
            arrives.
          </p>
        </Section>

        <Section title="Alterations and repairs">
          <p>
            Sleeves, hems and waistbands are altered free within the first year of purchase and at
            cost after that. Any MERIT piece can be sent back for repair at any point in its life.
            Altered pieces cannot be returned.
          </p>
        </Section>

        <Section title="Packaging">
          <p>
            Garments travel in unbleached cotton bags inside a recycled board box, closed with paper
            tape. There is no plastic in the parcel and no printed invoice — it is emailed instead.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            <Link href="/contact" className="link-rule text-ink">Write to client care</Link> and one
            person will answer within a working day.
          </p>
        </Section>
      </div>
    </TextPage>
  );
}
