import type { Metadata } from 'next';
import Image from 'next/image';
import { Section, TextPage } from '@/components/layout/TextPage';

export const metadata: Metadata = {
  title: 'Stores',
  description: 'The MERIT flagship on Al Urubah Road in Riyadh, and the Jeddah atelier, by appointment.',
  alternates: { canonical: '/stores' },
};

const STORES = [
  {
    city: 'Riyadh',
    kind: 'Flagship',
    address: ['Al Urubah Road', 'Al Olaya, Riyadh 12244'],
    hours: ['Saturday to Thursday, 10:00 — 22:00', 'Friday, 16:00 — 22:00'],
    note: 'The full range, alterations while you wait, and the archive rail at the back.',
    image: 'manifesto-rail',
  },
  {
    city: 'Jeddah',
    kind: 'Atelier',
    address: ['Al Rawdah District', 'Jeddah 23434'],
    hours: ['By appointment, Sunday to Thursday'],
    note: 'Fittings and made-to-measure tailoring. Write to book an hour.',
    image: 'atelier-basting',
  },
];

export default function StoresPage() {
  return (
    <TextPage
      eyebrow="Two rooms"
      title="Riyadh and Jeddah."
      standfirst="Everything is sold here and in two rooms. Both are invented, along with the rest of this site."
    >
      <div className="space-y-14">
        {STORES.map((s) => (
          <article key={s.city} className="grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
            <div className="frame frame-4-5" data-reveal-img>
              <Image src={`/img/${s.image}.webp`} alt="" width={1400} height={1750} sizes="(min-width:640px) 32vw, 100vw" />
            </div>
            <div>
              <p className="label-sm text-mute">{s.kind}</p>
              <h2 className="display-md mt-2">{s.city}</h2>
              <address className="mt-5 space-y-1 text-sm not-italic text-mute">
                {s.address.map((l) => <span key={l} className="block">{l}</span>)}
              </address>
              <div className="mt-5 space-y-1 text-sm text-mute">
                {s.hours.map((h) => <p key={h}>{h}</p>)}
              </div>
              <p className="mt-5 max-w-xs text-sm">{s.note}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14">
        <Section title="Stockists">
          <p>
            MERIT is not sold through department stores. A short list of independent rooms carries
            the Index range in Dubai, Kuwait City and Beirut; write to us for addresses.
          </p>
        </Section>
      </div>
    </TextPage>
  );
}
