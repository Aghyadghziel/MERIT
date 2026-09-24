import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/i18n/link';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { LINE_ROOM, SectionHead } from '@/components/ui/SectionHead';
import { getLocale } from '@/i18n/server';
import { cn } from '@/lib/cn';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'المتاجر' : 'Stores',
    description: ar
      ? 'متجر ميرت الرئيسي على طريق العروبة في الرياض، ومشغل جدة بموعد مسبق.'
      : 'The MERIT flagship on Al Urubah Road in Riyadh, and the Jeddah atelier, by appointment.',
    alternates: { canonical: ar ? '/ar/stores' : '/stores', languages: { en: '/stores', ar: '/ar/stores' } },
  };
}

type Room = {
  id: string;
  city: string;
  kind: string;
  when: string;
  dark: boolean;
  address: string[];
  hours: [string, string][];
  room: string[];
  image: { src: string; width: number; height: number; alt: string; position: string; sizes: string };
  cta: { label: string; href: string };
};

const IMG_SIZES = '(min-width:1024px) 46vw, 100vw';

const ROOMS: Record<'en' | 'ar', Room[]> = {
  en: [
    {
      id: 'riyadh',
      city: 'Riyadh',
      kind: 'Flagship',
      when: 'Open every day',
      dark: false,
      address: ['Al Urubah Road', 'Al Olaya, Riyadh 12244'],
      hours: [['Saturday to Thursday', '10:00 — 22:00'], ['Friday', '16:00 — 22:00']],
      room: ['The full range', 'Alterations while you wait', 'The archive rail at the back', 'Repairs at cost, for any MERIT piece'],
      image: { src: 'campaign-studio', width: 1400, height: 1750, alt: 'A model in a pale suit seated on a steel chair in a white studio, in black and white', position: '50% 30%', sizes: IMG_SIZES },
      cta: { label: 'Write to the flagship', href: '/contact' },
    },
    {
      id: 'jeddah',
      city: 'Jeddah',
      kind: 'Atelier',
      when: 'By appointment',
      dark: true,
      address: ['Al Rawdah District', 'Jeddah 23434'],
      hours: [['Sunday to Thursday', 'By appointment']],
      room: ['Fittings', 'Made-to-measure tailoring', 'An hour at a time, booked in writing'],
      image: { src: 'cat-tailoring', width: 1400, height: 1750, alt: 'A model in a white tailored suit against a grey wall, in black and white', position: '50% 30%', sizes: IMG_SIZES },
      cta: { label: 'Write to book an hour', href: '/contact' },
    },
  ],
  ar: [
    {
      id: 'riyadh',
      city: 'الرياض',
      kind: 'المتجر الرئيسي',
      when: 'مفتوح يوميًا',
      dark: false,
      address: ['طريق العروبة', 'العليا، الرياض 12244'],
      hours: [['من السبت إلى الخميس', '10:00 — 22:00'], ['الجمعة', '16:00 — 22:00']],
      room: ['التشكيلة كاملة', 'تعديلات فورية أثناء انتظارك', 'رفّ الأرشيف في آخر الصالة', 'إصلاح بسعر التكلفة لأي قطعة من ميرت'],
      image: { src: 'campaign-studio', width: 1400, height: 1750, alt: 'عارضة ببدلة فاتحة اللون جالسة على كرسي معدني في استوديو أبيض، بالأبيض والأسود', position: '50% 30%', sizes: IMG_SIZES },
      cta: { label: 'راسل المتجر الرئيسي', href: '/contact' },
    },
    {
      id: 'jeddah',
      city: 'جدة',
      kind: 'المشغل',
      when: 'بموعد مسبق',
      dark: true,
      address: ['حي الروضة', 'جدة 23434'],
      hours: [['من الأحد إلى الخميس', 'بموعد مسبق']],
      room: ['البروفات والقياسات', 'خياطة حسب المقاس', 'ساعة واحدة في كل مرة، تُحجز كتابيًا'],
      image: { src: 'cat-tailoring', width: 1400, height: 1750, alt: 'عارضة ببدلة بيضاء مفصّلة أمام جدار رمادي، بالأبيض والأسود', position: '50% 30%', sizes: IMG_SIZES },
      cta: { label: 'راسلنا لحجز ساعة', href: '/contact' },
    },
  ],
};

const STOCKISTS = {
  en: ['Dubai', 'Kuwait City', 'Beirut'],
  ar: ['دبي', 'مدينة الكويت', 'بيروت'],
};

const ARROW = 'h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1';

/**
 * Two rooms, side by side and lit differently: the flagship in daylight, the
 * atelier in graphite. Each carries only what a visitor needs — where, when,
 * what happens inside — and both are plainly marked as invented.
 */
export default async function StoresPage() {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const rooms = ROOMS[locale];
  return (
    <>
      <section className="page pt-(--nav-h)" aria-labelledby="stores-title">
        <div className="flex items-baseline justify-between gap-6 pt-[clamp(2.5rem,1.25rem+5.5vw,7.5rem)]">
          <p className="label" data-reveal>{ar ? 'المتاجر' : 'Stores'}</p>
          <p className="label-sm nums text-mute" data-reveal>{ar ? '02 صالتان' : '02 rooms'}</p>
        </div>
        <h1 id="stores-title" className={cn('mt-[clamp(1.5rem,0.75rem+3vw,4rem)] text-[clamp(3.5rem,0.75rem+11.5vw,13.5rem)] font-semibold leading-[0.84] tracking-[-0.06em]', LINE_ROOM)}>
          <Lines text={ar ? 'صالتان.' : 'Two rooms.'} />
        </h1>
        <div className="grid-page mt-[clamp(2rem,1rem+3.5vw,4.5rem)]">
          <p
            className="col-span-4 text-[clamp(1.125rem,0.95rem+0.7vw,1.625rem)] font-medium leading-[1.3] tracking-[-0.02em] text-ink-3 md:col-span-5 lg:col-span-5 lg:col-start-8"
            data-reveal
          >
            {ar
              ? 'كل شيء يُباع هنا وفي صالتين. وكلتاهما مُتخيَّلة، شأنهما شأن بقية هذا الموقع.'
              : 'Everything is sold here and in two rooms. Both are invented, along with the rest of this site.'}
          </p>
        </div>

        <nav aria-label={ar ? 'الصالتان' : 'Rooms'} className="mt-[clamp(2.5rem,1.5rem+4vw,6rem)]">
          <ul className="grid grid-cols-2 gap-x-(--gutter)">
            {rooms.map((r, i) => (
              <li key={r.id} className="border-t border-ink" data-reveal>
                <a href={`#${r.id}`} className="group flex min-h-14 items-center justify-between gap-3 py-3">
                  <span className="label flex items-baseline gap-3">
                    <span className="nums text-mute">{String(i + 1).padStart(2, '0')}</span>
                    <span>{r.city}<span className="hidden sm:inline"> — {r.kind}</span></span>
                  </span>
                  <Icon name="arrowR" className="h-3.5 w-3.5 rotate-90 transition-transform rtl:-rotate-90 duration-300 group-hover:translate-y-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div className="grid lg:grid-cols-2">
        {rooms.map((r, i) => (
          <article
            key={r.id}
            id={r.id}
            aria-labelledby={`${r.id}-title`}
            className={cn(
              'scroll-mt-(--nav-h) px-(--gutter) pb-[clamp(3.5rem,2rem+5vw,7rem)] pt-[clamp(2rem,1.25rem+3vw,4rem)]',
              r.dark ? 'on-ink bg-graphite text-bone' : 'bg-bone-2 text-ink',
            )}
          >
            <div className="flex items-baseline justify-between gap-4" data-reveal>
              <p className="label flex items-baseline gap-3">
                <span className={cn('nums', r.dark ? 'text-mute-ink' : 'text-mute')}>{String(i + 1).padStart(2, '0')}</span>
                {r.kind}
              </p>
              <p className={cn('label-sm', r.dark ? 'text-mute-ink' : 'text-mute')}>{r.when}</p>
            </div>

            <h2 id={`${r.id}-title`} className={cn('mt-[clamp(1.25rem,0.75rem+2vw,2.5rem)] text-[clamp(4rem,1rem+11.5vw,11.5rem)] font-semibold leading-[0.82] tracking-[-0.065em] lg:text-[clamp(4.5rem,0.5rem+8.4vw,11.5rem)]', LINE_ROOM)}>
              <Lines text={r.city} />
            </h2>

            <div className={cn('frame mt-[clamp(1.75rem,1rem+2.5vw,3.5rem)] aspect-[5/6]', r.dark && 'bg-ink-2')} data-reveal-img>
              <Image
                src={`/img/${r.image.src}.webp`}
                alt={r.image.alt}
                width={r.image.width}
                height={r.image.height}
                sizes={r.image.sizes}
                style={{ objectPosition: r.image.position }}
              />
            </div>

            <dl className="mt-[clamp(2rem,1.5rem+2vw,3.5rem)] grid gap-x-(--gutter) gap-y-9 sm:grid-cols-2">
              <div data-reveal>
                <dt className={cn('label-sm', r.dark ? 'text-mute-ink' : 'text-mute')}>{ar ? 'العنوان' : 'Address'}</dt>
                <dd className="mt-3">
                  <address className="text-[clamp(1.125rem,1rem+0.45vw,1.375rem)] font-medium not-italic leading-[1.25] tracking-[-0.02em]">
                    {r.address.map((l) => <span key={l} className="block">{l}</span>)}
                  </address>
                </dd>
              </div>

              <div data-reveal>
                <dt className={cn('label-sm', r.dark ? 'text-mute-ink' : 'text-mute')}>{ar ? 'ساعات العمل' : 'Hours'}</dt>
                <dd className="mt-3 space-y-2">
                  {r.hours.map(([d, t]) => (
                    <p key={d} className="flex items-baseline justify-between gap-4 border-b border-current/15 pb-2 text-sm">
                      <span>{d}</span>
                      <span className="nums whitespace-nowrap font-medium">{t}</span>
                    </p>
                  ))}
                </dd>
              </div>

              <div className="sm:col-span-2" data-reveal>
                <dt className={cn('label-sm', r.dark ? 'text-mute-ink' : 'text-mute')}>{ar ? 'داخل الصالة' : 'In the room'}</dt>
                <dd className="mt-3">
                  <ul className="border-t border-current/15">
                    {r.room.map((x, n) => (
                      <li key={x} className="flex items-baseline gap-4 border-b border-current/15 py-3 text-[clamp(1rem,0.95rem+0.25vw,1.125rem)]">
                        <span className={cn('label-sm nums w-6 shrink-0', r.dark ? 'text-mute-ink' : 'text-mute')}>{String(n + 1).padStart(2, '0')}</span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal>
              <Link href={r.cta.href} className="btn btn-solid">
                {r.cta.label} <Icon name="arrowR" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section className="page section-y" aria-labelledby="stockists-title">
        <SectionHead index={3} title={ar ? 'نقاط البيع' : 'Stockists'} id="stockists-title" tone="ink" note={ar ? 'تشكيلة الفهرس فقط' : 'Index range only'} />
        <div className="grid-page mt-[clamp(2.5rem,1.5rem+4vw,6rem)] gap-y-8">
          <p className={cn('display-lg col-span-4 max-w-[15ch] md:col-span-6 lg:col-span-7', LINE_ROOM)}>
            <Lines text={ar ? 'لا نبيع عبر المتاجر الكبرى.' : 'Not sold through department stores.'} />
          </p>
          <div className="col-span-4 self-end md:col-span-4 lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="body-lg text-ink-3">
              {ar
                ? 'تحمل قائمة قصيرة من المتاجر المستقلة تشكيلة الفهرس في دبي ومدينة الكويت وبيروت. راسلنا لمعرفة العناوين.'
                : 'A short list of independent rooms carries the Index range in Dubai, Kuwait City and Beirut. Write to us for addresses.'}
            </p>
            <ul className="mt-6 border-t border-line">
              {STOCKISTS[locale].map((c) => (
                <li key={c} className="border-b border-line py-3 text-[clamp(1.125rem,1rem+0.45vw,1.375rem)] font-medium tracking-[-0.02em]">{c}</li>
              ))}
            </ul>
            <Link href="/contact" className="label group mt-8 inline-flex min-h-11 items-center gap-2">
              {ar ? 'راسلنا لمعرفة العناوين' : 'Write for addresses'}
              <Icon name="arrowR" className={ARROW} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
