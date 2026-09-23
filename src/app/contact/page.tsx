import type { Metadata } from 'next';
import Link from 'next/link';
import { TextPage } from '@/components/layout/TextPage';
import { ContactForm } from '@/components/ui/ContactForm';
import { Icon } from '@/components/ui/Icon';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to MERIT about an order, an alteration, or an appointment in Riyadh or Jeddah.',
  alternates: { canonical: '/contact' },
};

const BEFORE = [
  { label: 'Frequently asked', note: 'Sizing, delivery, returns and care', href: '/faq' },
  { label: 'Shipping and returns', note: 'Times, costs and the thirty days', href: '/shipping-returns' },
  { label: 'Size guide', note: 'Finished measurements, in cm or inches', href: '/size-guide' },
  { label: 'Stores', note: 'The Riyadh flagship and the Jeddah atelier', href: '/stores' },
];

const VALUE = 'mt-2 text-[clamp(1.0625rem,0.95rem+0.4vw,1.3125rem)] font-medium leading-snug tracking-[-0.02em]';

export default function ContactPage() {
  return (
    <TextPage
      eyebrow="Client care"
      title="Write to us."
      standfirst="One person reads everything that arrives here and answers within a working day."
      aside={
        <dl className="grid grid-cols-1 gap-x-(--gutter) gap-y-8 border-t border-ink pt-6 sm:grid-cols-2 lg:grid-cols-1 lg:border-0 lg:pt-0">
          <div>
            <dt className="label-sm text-mute">Email</dt>
            <dd className={VALUE}>
              <a href={`mailto:${BRAND.email}`} className="link-rule break-all">{BRAND.email}</a>
            </dd>
          </div>
          <div>
            <dt className="label-sm text-mute">Telephone</dt>
            <dd className={`${VALUE} nums`}>{BRAND.phone}</dd>
          </div>
          <div>
            <dt className="label-sm text-mute">Hours</dt>
            <dd className={VALUE}>
              Sunday to Thursday
              <span className="nums block text-mute">09:00 — 18:00 AST</span>
            </dd>
          </div>
          <div>
            <dt className="label-sm text-mute">Press</dt>
            <dd className={VALUE}>
              <a href="mailto:press@merit.example" className="link-rule break-all">press@merit.example</a>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <dt className="label-sm text-mute">Appointments</dt>
            <dd className="mt-2 max-w-[30ch] text-sm leading-relaxed text-mute">
              Fittings at the Jeddah atelier are booked in writing — choose &ldquo;An appointment&rdquo;
              in the form. <Link href="/stores#jeddah" className="link-rule text-ink">The atelier</Link>
            </dd>
          </div>
        </dl>
      }
      asideLast
    >
      <ContactForm />

      <nav aria-labelledby="before-title" className="mt-[clamp(4rem,2.5rem+5vw,8rem)]">
        <p id="before-title" className="label-sm text-mute" data-reveal>Before you write</p>
        <ul className="mt-4 border-t border-ink">
          {BEFORE.map((b) => (
            <li key={b.href} className="border-b border-line" data-reveal>
              <Link href={b.href} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <span className="text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-semibold leading-none tracking-[-0.035em] transition-transform duration-500 ease-(--ease-out) md:group-hover:translate-x-2">
                  {b.label}
                </span>
                <span className="col-start-1 row-start-2 text-sm text-mute md:col-start-2 md:row-start-1">{b.note}</span>
                <Icon name="arrowR" className="col-start-2 row-span-2 row-start-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 md:col-start-3 md:row-span-1" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </TextPage>
  );
}
