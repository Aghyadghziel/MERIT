import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, TextPage } from '@/components/layout/TextPage';

export const metadata: Metadata = {
  title: 'Shipping and returns',
  description: 'Delivery times and costs for Saudi Arabia, the Gulf and the rest of the world, and how MERIT returns work.',
  alternates: { canonical: '/shipping-returns' },
};

const RATES = [
  { where: 'Riyadh and Jeddah', time: '2 working days', cost: 'Free over 1,500 SAR', else: 'Otherwise 35 SAR' },
  { where: 'Rest of Saudi Arabia', time: '2–3 working days', cost: 'Free over 1,500 SAR', else: 'Otherwise 45 SAR' },
  { where: 'GCC', time: '3–5 working days', cost: 'Free over 1,500 SAR', else: 'Otherwise 90 SAR' },
  { where: 'Europe and UK', time: '5–8 working days', cost: '120 SAR', else: 'Duties settled at checkout' },
  { where: 'Rest of world', time: '5–10 working days', cost: '160 SAR', else: 'Duties settled at checkout' },
];

export default function ShippingPage() {
  return (
    <TextPage
      eyebrow="Client care"
      title="Shipping and returns."
      standfirst="Parcels travel in cotton and board, never plastic, and international duties are settled at checkout, so nothing is owed at the door."
      facts={[
        { label: 'Packed the same day', value: '14:00', unit: 'AST', note: 'Order before, Sunday to Thursday.' },
        { label: 'To return', value: '30', unit: 'days', note: 'Collected free inside Saudi Arabia.' },
        { label: 'Free delivery', value: '1,500', unit: 'SAR', note: 'Over this, in Saudi Arabia and the GCC.' },
        { label: 'Refund', value: '5–7', unit: 'days', note: 'Working days, to the card that paid.' },
      ]}
      toc={[
        { id: 'delivery', label: 'Delivery' },
        { id: 'returns', label: 'Returns' },
        { id: 'exchanges', label: 'Exchanges' },
        { id: 'alterations', label: 'Alterations and repairs' },
        { id: 'packaging', label: 'Packaging' },
        { id: 'questions', label: 'Questions' },
      ]}
    >
      <Section id="delivery" title="Delivery" plain>
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Delivery times and costs by destination</caption>
          <colgroup>
            <col className="w-[38%] md:w-[36%]" />
            <col className="w-[28%] md:w-[26%]" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-y border-ink">
              {['Destination', 'Time', 'Cost'].map((h) => (
                <th key={h} scope="col" className="label-sm py-3.5 pr-3 font-semibold text-mute md:pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATES.map((r) => (
              <tr key={r.where} className="border-b border-line align-top">
                <th scope="row" className="py-5 pr-3 text-[clamp(0.9375rem,0.85rem+0.45vw,1.25rem)] font-semibold leading-tight tracking-[-0.02em] md:pr-6">
                  {r.where}
                </th>
                <td className="nums py-5 pr-3 text-sm leading-snug text-ink-3 md:pr-6 md:text-[0.9375rem]">{r.time}</td>
                <td className="py-5 text-sm leading-snug md:text-[0.9375rem]">
                  <span className="nums block font-medium">{r.cost}</span>
                  <span className="nums mt-1 block text-mute">{r.else}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="returns" title="Returns">
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

      <Section id="exchanges" title="Exchanges">
        <p>
          We do not process exchanges as a separate transaction — return the piece and place a new order,
          so the size you want is held for you immediately rather than after the parcel arrives.
        </p>
      </Section>

      <Section id="alterations" title="Alterations and repairs">
        <p>
          Sleeves, hems and waistbands are altered free within the first year of purchase and at cost
          after that. Any MERIT piece can be sent back for repair at any point in its life. Altered
          pieces cannot be returned.
        </p>
      </Section>

      <Section id="packaging" title="Packaging">
        <p>
          Garments travel in unbleached cotton bags inside a recycled board box, closed with paper tape.
          There is no plastic in the parcel and no printed invoice — it is emailed instead.
        </p>
      </Section>

      <Section id="questions" title="Questions">
        <p>
          <Link href="/contact" className="link-rule">Write to client care</Link> and one person will
          answer within a working day.
        </p>
      </Section>
    </TextPage>
  );
}
