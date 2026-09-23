import type { Metadata } from 'next';
import { ContactForm } from '@/components/ui/ContactForm';
import { TextPage } from '@/components/layout/TextPage';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to MERIT about an order, an alteration, or an appointment in Riyadh or Jeddah.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <TextPage
      eyebrow="Client care"
      title="Write to us."
      standfirst="One person reads everything that arrives here and answers within a working day."
      aside={
        <div className="space-y-6 text-sm lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
          <div>
            <p className="label-sm text-mute">Email</p>
            <a href={`mailto:${BRAND.email}`} className="link-rule mt-1 inline-block">{BRAND.email}</a>
          </div>
          <div>
            <p className="label-sm text-mute">Telephone</p>
            <p className="nums mt-1">{BRAND.phone}</p>
          </div>
          <div>
            <p className="label-sm text-mute">Hours</p>
            <p className="mt-1 text-mute">Sunday to Thursday, 09:00 — 18:00 (AST)</p>
          </div>
          <div>
            <p className="label-sm text-mute">Press</p>
            <p className="mt-1 text-mute">press@merit.example</p>
          </div>
        </div>
      }
    >
      <ContactForm />
    </TextPage>
  );
}
