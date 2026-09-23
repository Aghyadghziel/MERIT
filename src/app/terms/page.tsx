import type { Metadata } from 'next';
import { Section, TextPage } from '@/components/layout/TextPage';

export const metadata: Metadata = {
  title: 'Terms of sale',
  description: 'The terms that would govern a MERIT order.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Terms of sale."
      standfirst="MERIT is a fictional label built as a demonstration. Nothing here can be bought, so nothing below creates an obligation on anyone."
    >
      <Section title="The company">
        <p>
          MERIT and Merit Atelier are invented names. There is no registered company, no commercial
          registration number and no VAT registration behind this site. Any resemblance to a real
          label is unintended.
        </p>
      </Section>

      <Section title="Products and prices">
        <p>
          Every garment, material, mill, count, stock level and price shown is invented for the
          purposes of the demonstration. Prices are displayed in Saudi riyals; other currencies are
          converted at a fixed indicative rate and are not live.
        </p>
      </Section>

      <Section title="Orders">
        <p>
          The checkout is deliberately not connected to a payment processor. No order can be placed,
          no card can be charged and nothing will be shipped.
        </p>
      </Section>

      <Section title="What a real version would say">
        <p>
          A live MERIT would form a contract at the point of dispatch rather than payment, would be
          governed by the laws of the Kingdom of Saudi Arabia, and would set out the statutory
          right to return within the periods stated in the shipping and returns page. This
          paragraph stands in for that text.
        </p>
      </Section>

      <Section title="Content">
        <p>
          The design, code, wordmark and written copy on this site were made for it. The photography
          is placeholder material from Unsplash, used under the Unsplash Licence and credited in the
          repository.
        </p>
      </Section>
    </TextPage>
  );
}
