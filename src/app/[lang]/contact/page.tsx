import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { TextPage } from '@/components/layout/TextPage';
import { ContactForm } from '@/components/ui/ContactForm';
import { Icon } from '@/components/ui/Icon';
import { getLocale } from '@/i18n/server';
import { BRAND } from '@/lib/brand';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'كلّمنا' : 'Contact',
    description: ar
      ? 'راسل ميرت عن طلب أو تعديل أو موعد في الرياض أو جدة.'
      : 'Write to MERIT about an order, an alteration, or an appointment in Riyadh or Jeddah.',
    alternates: { canonical: ar ? '/ar/contact' : '/contact', languages: { en: '/contact', ar: '/ar/contact' } },
  };
}

const BEFORE = {
  en: [
    { label: 'Frequently asked', note: 'Sizing, delivery, returns and care', href: '/faq' },
    { label: 'Shipping and returns', note: 'Times, costs and the thirty days', href: '/shipping-returns' },
    { label: 'Size guide', note: 'Finished measurements, in cm or inches', href: '/size-guide' },
    { label: 'Stores', note: 'The Riyadh flagship and the Jeddah atelier', href: '/stores' },
  ],
  ar: [
    { label: 'أسئلة تتكرر', note: 'المقاسات والتوصيل والإرجاع والعناية', href: '/faq' },
    { label: 'الشحن والإرجاع', note: 'المدة والتكلفة، والإرجاع خلال ثلاثين يوم', href: '/shipping-returns' },
    { label: 'دليل المقاسات', note: 'المقاسات النهائية، بالسنتي أو الإنش', href: '/size-guide' },
    { label: 'فروعنا', note: 'الفرع الرئيسي في الرياض ومشغل جدة', href: '/stores' },
  ],
};

const VALUE = 'mt-2 text-[clamp(1.0625rem,0.95rem+0.4vw,1.3125rem)] font-medium leading-snug tracking-[-0.02em]';

export default async function ContactPage() {
  const locale = await getLocale();
  const ar = locale === 'ar';
  return (
    <TextPage
      eyebrow={ar ? 'خدمة العملاء' : 'Client care'}
      title={ar ? 'راسلنا.' : 'Write to us.'}
      standfirst={ar
        ? 'شخص واحد يقرأ كل شي يوصل هنا، ويرد خلال يوم عمل.'
        : 'One person reads everything that arrives here and answers within a working day.'}
      aside={
        <dl className="grid grid-cols-1 gap-x-(--gutter) gap-y-8 border-t border-ink pt-6 sm:grid-cols-2 lg:grid-cols-1 lg:border-0 lg:pt-0">
          <div>
            <dt className="label-sm text-mute">{ar ? 'الإيميل' : 'Email'}</dt>
            <dd className={VALUE}>
              <a href={`mailto:${BRAND.email}`} className="link-rule break-all">{BRAND.email}</a>
            </dd>
          </div>
          <div>
            <dt className="label-sm text-mute">{ar ? 'الجوال' : 'Telephone'}</dt>
            <dd className={`${VALUE} nums`}><span dir="ltr">{BRAND.phone}</span></dd>
          </div>
          {/* On the Arabic site, WhatsApp: how a Saudi customer reaches a shop.
              The number is the placeholder above, so it is not linked. */}
          {ar ? (
            <div>
              <dt className="label-sm text-mute">واتساب</dt>
              <dd className={VALUE}>
                على الرقم نفسه
                <span className="block text-mute">رقم تجريبي، ما يستقبل رسايل</span>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="label-sm text-mute">{ar ? 'أوقات الدوام' : 'Hours'}</dt>
            <dd className={VALUE}>
              {ar ? 'من الأحد للخميس' : 'Sunday to Thursday'}
              <span className="nums block text-mute">{ar ? 'من 9 الصبح لين 6 المغرب بتوقيت السعودية' : '09:00 — 18:00 AST'}</span>
            </dd>
          </div>
          <div>
            <dt className="label-sm text-mute">{ar ? 'الصحافة' : 'Press'}</dt>
            <dd className={VALUE}>
              <a href="mailto:press@merit.example" className="link-rule break-all">press@merit.example</a>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <dt className="label-sm text-mute">{ar ? 'المواعيد' : 'Appointments'}</dt>
            <dd className="mt-2 max-w-[30ch] text-sm leading-relaxed text-mute">
              {ar ? (
                <>
                  البروفات في مشغل جدة تنحجز برسالة — اختر «موعد» في النموذج.{' '}
                  <Link href="/stores#jeddah" className="link-rule text-ink">المشغل</Link>
                </>
              ) : (
                <>
                  Fittings at the Jeddah atelier are booked in writing — choose &ldquo;An appointment&rdquo;
                  in the form. <Link href="/stores#jeddah" className="link-rule text-ink">The atelier</Link>
                </>
              )}
            </dd>
          </div>
        </dl>
      }
      asideLast
    >
      <ContactForm />

      <nav aria-labelledby="before-title" className="mt-[clamp(4rem,2.5rem+5vw,8rem)]">
        <p id="before-title" className="label-sm text-mute" data-reveal>{ar ? 'قبل ما تكتب' : 'Before you write'}</p>
        <ul className="mt-4 border-t border-ink">
          {BEFORE[locale].map((b) => (
            <li key={b.href} className="border-b border-line" data-reveal>
              <Link href={b.href} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <span className="text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-semibold leading-none tracking-[-0.035em] transition-transform duration-500 ease-(--ease-out) md:group-hover:translate-x-2 rtl:md:group-hover:-translate-x-2">
                  {b.label}
                </span>
                <span className="col-start-1 row-start-2 text-sm text-mute md:col-start-2 md:row-start-1">{b.note}</span>
                <Icon name="arrowR" className="col-start-2 row-span-2 row-start-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 md:col-start-3 md:row-span-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </TextPage>
  );
}
