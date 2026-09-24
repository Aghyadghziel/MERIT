import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/i18n/link';
import { Drift, LogoWindow, Strike, Unfold } from '@/components/layout/TextPage';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { LINE_ROOM, SectionHead } from '@/components/ui/SectionHead';
import { Wordmark } from '@/components/ui/Wordmark';
import { BRAND } from '@/lib/brand';
import { getLocale, getT } from '@/i18n/server';
import { collections } from '@/lib/catalog';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'عن الدار' : 'About',
    description: ar
      ? 'ميرت علامة أزياء معاصرة من الرياض، تصنع الخياطة والمعاطف والتريكو بكميات قليلة.'
      : 'MERIT is a contemporary fashion label based in Riyadh, making tailoring, outerwear and knitwear in small counts.',
    alternates: { canonical: ar ? '/ar/about' : '/about', languages: { en: '/about', ar: '/ar/about' } },
  };
}

/** English and Arabic side by side; `L(ar)` picks one. */
type Pair = { en: string; ar: string };
const L = (ar: boolean) => (p: Pair) => (ar ? p.ar : p.en);

const FACTS: [Pair, Pair][] = [
  [{ en: 'Founded', ar: 'التأسيس' }, { en: `${BRAND.founded}, ${BRAND.city}`, ar: `${BRAND.founded}، الرياض` }],
  [{ en: 'Made in', ar: 'بلد الصنع' }, { en: 'Italy, Portugal, Scotland', ar: 'إيطاليا، البرتغال، اسكتلندا' }],
  [{ en: 'Collections a year', ar: 'المجموعات في السنة' }, { en: 'Two, plus a permanent range', ar: 'مجموعتان، إلى جانب تشكيلة دائمة' }],
  [{ en: 'Sold', ar: 'البيع' }, { en: 'Directly, and in two rooms', ar: 'مباشرةً، وفي صالتين' }],
];

const PROPORTION: [Pair, Pair][] = [
  [{ en: 'Jacket', ar: 'السترة' }, { en: 'Drawn to end where the trouser reads best.', ar: 'تُرسَم لتنتهي حيث يبدو البنطال في أحسن حالاته.' }],
  [{ en: 'Knit', ar: 'التريكو' }, { en: 'Cut to sit over its waistband.', ar: 'يُقصّ ليستقر فوق حزام خصر البنطال.' }],
  [{ en: 'Coat', ar: 'المعطف' }, { en: 'Long enough to cover both.', ar: 'طويل بما يكفي ليغطيهما معًا.' }],
];

const SEASON_OF: Record<string, Pair> = {
  foundation: { en: 'Autumn', ar: 'الخريف' },
  atrium: { en: 'Spring', ar: 'الربيع' },
  index: { en: 'Permanent', ar: 'دائمة' },
};
const SEASONS = collections.filter((c) => c.slug in SEASON_OF);

const MAKERS = [
  {
    key: 'biella',
    place: { en: 'Biella', ar: 'بييلا' }, country: { en: 'Italy', ar: 'إيطاليا' },
    what: { en: 'Tailoring and trousers', ar: 'الخياطة والبناطيل' },
    detail: { en: 'Made outside the town, in a factory of thirty-one people.', ar: 'تُصنع خارج البلدة، في مصنع يعمل فيه واحد وثلاثون شخصًا.' },
    img: 'material-wool', alt: { en: 'Grey-green wool cloth, close up', ar: 'قماش صوف رمادي مخضرّ، عن قرب' },
  },
  {
    key: 'portugal',
    place: { en: 'Portugal', ar: 'البرتغال' }, country: { en: 'Portugal', ar: 'البرتغال' },
    what: { en: 'Outerwear and shirting', ar: 'المعاطف والقمصان' },
    detail: { en: 'Made in the north of the country.', ar: 'تُصنع في شمال البلاد.' },
    img: 'material-linen', alt: { en: 'Undyed linen cloth, close up', ar: 'قماش كتان غير مصبوغ، عن قرب' },
  },
  {
    key: 'hawick',
    place: { en: 'Hawick', ar: 'هاويك' }, country: { en: 'Scotland', ar: 'اسكتلندا' },
    what: { en: 'Knitwear', ar: 'التريكو' },
    detail: { en: 'Framed in Hawick, in the Scottish Borders.', ar: 'يُحاك على الأنوال في هاويك، في منطقة الحدود الاسكتلندية.' },
    img: 'material-fold', alt: { en: 'Black cloth folded on white', ar: 'قماش أسود مطويّ على خلفية بيضاء' },
  },
] as const;

/** Struck through on the page; a screen reader hears the "No" in front. The
    Arabic reads as لا + an indefinite noun: "no mid-season markdowns". */
const REFUSALS: Pair[] = [
  { en: 'Mid-season markdowns.', ar: 'تخفيضات في منتصف الموسم.' },
  { en: 'Fabricated scarcity.', ar: 'ندرة مصطنعة.' },
  { en: 'Discount codes for an email address.', ar: 'رموز خصم مقابل عنوان بريد إلكتروني.' },
];

const ARROW = 'h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1';

const BASTED_ALT: Pair = {
  en: "A navy jacket basted in white thread on a tailor's stand, a houndstooth waistcoat hanging behind it",
  ar: 'سترة كحلية مسرّجة بخيط أبيض على مجسّم خيّاط، وخلفها صديري بنقشة هاوندستوث معلّق',
};

/**
 * The manifesto. Five chapters on one rule, lit like the house: warm white,
 * one graphite room for what the label refuses to do, and the logotype used
 * as a window rather than a stamp.
 */
export default async function AboutPage() {
  const ar = (await getLocale()) === 'ar';
  const l = L(ar);
  const t = await getT();
  return (
    <>
      {/* ─── Opening ───────────────────────────────────────────────────── */}
      <section className="overflow-hidden pt-(--nav-h)" aria-labelledby="about-title">
        <div className="page pt-[clamp(1.75rem,0.75rem+3.5vw,4.5rem)]">
          <div className="flex items-baseline justify-between gap-6">
            <p className="label" data-reveal>{ar ? 'الدار' : 'The house'}</p>
            <p className="label nums" data-reveal>{ar ? `الرياض — منذ ${BRAND.founded}` : `${BRAND.city} — since ${BRAND.founded}`}</p>
          </div>

          {/* A runway frame, graded to the house greys: the dark crowd fills
              the letters with ink, and the model walks through the E and R. */}
          <LogoWindow
            src="/img/runway-01.webp"
            width={2560}
            height={1440}
            position="50% 4%"
            priority
            className="mt-[clamp(1.25rem,0.75rem+2vw,2.75rem)] [filter:grayscale(1)_contrast(1.12)_brightness(1.04)]"
          />

          <h1
            id="about-title"
            className={`mt-[clamp(1.75rem,1rem+3vw,4rem)] text-[clamp(2.75rem,0.9rem+7.4vw,9rem)] font-semibold leading-[0.88] tracking-[-0.055em] ${LINE_ROOM}`}
          >
            <span className="block"><Lines text={ar ? 'بنية هادئة،' : 'Quiet structure,'} /></span>
            <Drift from={12} to={0} start="top 80%" end="bottom 10%" className="md:whitespace-nowrap">
              <Lines text={ar ? 'وحركة معبّرة.' : 'expressive movement.'} />
            </Drift>
          </h1>
        </div>
      </section>

      {/* ─── Standfirst and the facts ─────────────────────────────────── */}
      <section className="page grid-page pt-[clamp(3rem,1.5rem+5vw,7rem)]" aria-label={ar ? 'العلامة باختصار' : 'The label in brief'}>
        <p className="col-span-4 md:col-span-4 lg:col-span-3 label text-mute" data-reveal>{BRAND.legal}</p>
        <p
          className="col-span-4 text-[clamp(1.375rem,1rem+1.35vw,2.375rem)] font-medium leading-[1.14] tracking-[-0.03em] md:col-span-6 lg:col-span-7 lg:col-start-6"
          data-reveal
        >
          {ar
            ? 'تصنع ميرت أشياء قليلة، وتواصل صنعها طويلًا. تبقى البنية ثابتة كي يتحرك القماش.'
            : 'MERIT makes a small number of things and makes them for a long time. The structure stays still so the cloth can move.'}
        </p>

        <dl className="col-span-4 mt-[clamp(2.5rem,1.5rem+4vw,6rem)] grid grid-cols-2 gap-x-(--gutter) gap-y-8 md:col-span-6 lg:col-span-12 lg:grid-cols-4">
          {FACTS.map(([k, v]) => (
            <div key={k.en} className="border-t border-ink pt-4" data-reveal>
              <dt className="label-sm text-mute">{l(k)}</dt>
              <dd className="mt-[clamp(1rem,0.5rem+1.5vw,2rem)] text-[clamp(1.125rem,0.85rem+0.9vw,1.75rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                {l(v)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ─── The atelier, opening out to the edge ─────────────────────── */}
      <figure className="mt-[clamp(4rem,2.5rem+6vw,9rem)]">
        <Unfold className="h-[68svh] min-h-[26rem] bg-bone-2 md:h-[min(90svh,60rem)]">
          {/* Art-directed: the wide crop on a screen, the whole jacket on a phone. */}
          <Image
            src="/img/atelier-basting-wide.webp"
            alt={l(BASTED_ALT)}
            fill
            sizes="110vw"
            className="hidden object-cover object-[50%_40%] [filter:saturate(0.9)_contrast(1.03)] md:block"
          />
          <Image
            src="/img/atelier-basting.webp"
            alt={l(BASTED_ALT)}
            fill
            sizes="125vw"
            className="object-cover object-[50%_45%] [filter:saturate(0.9)_contrast(1.03)] md:hidden"
          />
        </Unfold>
        <figcaption className="page mt-4 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <span className="label-sm text-mute">{ar ? 'سترة مسطرة مسرّجةً، قبل نزع الخيط الأبيض' : 'The Rule jacket, basted, before the white thread comes out'}</span>
          <Link href="/editorial/on-making-the-basted-jacket" className="label group inline-flex min-h-11 items-center gap-2 sm:-my-3.5">
            {ar ? 'عن صنع السترة المسرّجة' : 'On making the basted jacket'}
            <Icon name="arrowR" className={ARROW} />
          </Link>
        </figcaption>
      </figure>

      {/* ─── 01 The idea ───────────────────────────────────────────────── */}
      <section className="page section-y" aria-labelledby="ch-idea">
        <SectionHead index={1} title={ar ? 'الفكرة' : 'The idea'} id="ch-idea" tone="ink" note={ar ? `تأسست عام ${BRAND.founded}` : `Set up in ${BRAND.founded}`} />
        <div className="grid-page mt-[clamp(2.5rem,1.5rem+4vw,6rem)] gap-y-12">
          <p className={`display-lg col-span-4 max-w-[19ch] md:col-span-6 lg:col-span-10 ${LINE_ROOM}`}>
            <Lines text={ar ? 'قصّات قليلة تُقصّ كما ينبغي، ويُعاد إصدارها بدل أن تُستبدَل.' : 'Cut a small number of shapes properly, and re-issue them rather than replace them.'} />
          </p>

          <div className="col-span-4 md:col-span-3 lg:col-span-4 lg:mt-8">
            <div className="frame frame-1-1" data-reveal-img>
              <Image src="/img/statement-detail.webp" alt={ar ? 'حزام صوف رمادي معقود عند خصر معطف، عن قرب' : 'A grey wool belt knotted at the waist of a coat, close up'} width={1400} height={1400} sizes="(min-width:1024px) 30vw, (min-width:768px) 48vw, 100vw" />
            </div>
          </div>

          <div className="col-span-4 space-y-5 self-end text-ink-3 md:col-span-3 lg:col-span-5 lg:col-start-7" data-reveal>
            {ar ? (
              <>
                <p className="body-lg">
                  تأسست ميرت عام {BRAND.founded} على يد قاطع باترونات ومشترٍ أمضيا عقدًا من الزمن يشاهدان
                  القماش الجيد يتحوّل إلى ملابس لا تصمد أكثر من موسم واحد. وُجدت العلامة لتفعل العكس، انطلاقًا
                  من قوالب باترونات خاصة بها.
                </p>
                <p className="body-lg">
                  شعار الدار: بنية هادئة، وحركة معبّرة. البنية هي الجزء الذي لا تراه — صدر مدعّم بالكانفاس،
                  وحزام خصر مبطّن، وحاشية عميقة بما يكفي لتنسدل. أما الحركة فهي ما يفعله القماش حين تكفّ تلك
                  البنية عن مقاومته.
                </p>
              </>
            ) : (
              <>
                <p className="body-lg">
                  MERIT was set up in {BRAND.founded} by a pattern cutter and a buyer who had spent a decade
                  watching good cloth turned into clothes that lasted one season. The label exists to do the
                  opposite, working from blocks of its own.
                </p>
                <p className="body-lg">
                  The house line is quiet structure, expressive movement. The structure is the part you do not
                  see — a canvassed chest, a faced waistband, a hem deep enough to hang. The movement is what
                  the cloth does once that structure stops fighting it.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── 02 How the range is built ─────────────────────────────────── */}
      <section className="page pb-(--section)" aria-labelledby="ch-range">
        <SectionHead index={2} title={ar ? 'كيف تُبنى التشكيلة' : 'How the range is built'} id="ch-range" tone="ink" note={ar ? 'قطعة واحدة' : 'One garment'} />
        <div className="grid-page mt-[clamp(2.5rem,1.5rem+4vw,6rem)] gap-y-12">
          <figure className="col-span-4 md:col-span-3 lg:col-span-5">
            <div className="frame frame-4-5" data-reveal-img>
              <Image src="/img/trouser-column-3.webp" alt={ar ? 'عارضة جالسة على كرسي خشبي عالٍ، ترتدي بنطالًا واسعًا بلون الحجر وقميصًا أبيض' : 'A model seated on a wooden stool in wide stone trousers and a white shirt'} width={1400} height={1750} sizes="(min-width:1024px) 40vw, (min-width:768px) 48vw, 100vw" />
            </div>
            <figcaption className="label-sm mt-3 text-mute">{ar ? 'بنطال عمود — القطعة التي تُقاس عليها التشكيلة كلها' : 'The Column trouser — the garment the range is measured against'}</figcaption>
          </figure>

          <div className="col-span-4 md:col-span-3 lg:col-span-6 lg:col-start-7 lg:pt-4">
            <p className={`display-lg max-w-[14ch] ${LINE_ROOM}`}>
              <Lines text={ar ? 'كل شيء يُقاس تناسبه على قطعة واحدة.' : 'Everything is proportioned against one garment.'} />
            </p>
            <p className="body-lg mt-6 max-w-[46ch] text-ink-3" data-reveal>
              {ar
                ? 'بنطال عمود. كل قطعة أخرى تُرسَم نسبةً إليه، ولهذا تظهر التشكيلة في الصور تشكيلةً واحدة متماسكة.'
                : 'The Column trouser. Every other piece is drawn in relation to it, which is why the range photographs as a range.'}
            </p>
            <dl className="mt-10 border-t border-ink">
              {PROPORTION.map(([k, v]) => (
                <div key={k.en} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-4 md:grid-cols-[7rem_minmax(0,1fr)]" data-reveal>
                  <dt className="label">{l(k)}</dt>
                  <dd className="text-[clamp(1.0625rem,0.95rem+0.4vw,1.3125rem)] font-medium leading-snug tracking-[-0.015em]">{l(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-[clamp(4rem,2.5rem+5vw,8rem)]">
          <p className="label text-mute" data-reveal>{ar ? 'موسمان، حول تشكيلة دائمة' : 'Two seasons, around a permanent range'}</p>
          <ul className="mt-5 grid grid-cols-1 gap-x-(--gutter) md:grid-cols-3">
            {SEASONS.map((c) => (
              <li key={c.slug} className="border-t border-ink" data-reveal>
                <Link href={`/collections/${c.slug}`} className="group block pb-8 pt-4">
                  <span className="label-sm text-mute">{l(SEASON_OF[c.slug])}</span>
                  <span className="mt-5 flex items-center justify-between gap-4 text-[clamp(2.25rem,1.3rem+3vw,4.5rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
                    {t(c.name)}
                    <Icon name="arrowR" className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                  <span className="mt-4 block max-w-[32ch] text-sm leading-relaxed text-mute">
                    {c.slug === 'index'
                      ? (ar
                        ? 'تُقصّ من الباترونات نفسها كل عام، ولا تتغيّر إلا حين يكون فيها خطأ.'
                        : 'Cut from the same patterns every year, and changed only when something is wrong with it.')
                      : t(c.statement)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── 03 Where things are made ──────────────────────────────────── */}
      <section className="page pb-(--section)" aria-labelledby="ch-made">
        <SectionHead index={3} title={ar ? 'أين تُصنع القطع' : 'Where things are made'} id="ch-made" tone="ink" note={ar ? 'ثلاث دول' : 'Three countries'} />
        <div className="grid-page mt-[clamp(2.5rem,1.5rem+4vw,6rem)] gap-y-8">
          <p className={`display-lg col-span-4 max-w-[13ch] md:col-span-4 lg:col-span-7 ${LINE_ROOM}`}>
            <Lines text={ar ? 'الصناعة ليست سرًّا.' : 'The making is not a secret.'} />
          </p>
          <p className="body-lg col-span-4 max-w-[40ch] self-end text-ink-3 md:col-span-4 lg:col-span-4 lg:col-start-9" data-reveal>
            {ar
              ? 'نزور كلًّا منها مرتين في السنة، ونذكر اسمه في صفحة كل منتج.'
              : 'We visit each of them twice a year, and we name them on every product page.'}
          </p>
        </div>

        <ol className="mt-[clamp(2.5rem,1.5rem+3vw,5rem)] border-b border-ink">
          {MAKERS.map((m, i) => (
            <li
              key={m.key}
              className="flex flex-wrap items-center gap-x-(--gutter) gap-y-4 border-t border-ink py-[clamp(1.25rem,0.75rem+1.8vw,2.5rem)] md:flex-nowrap"
              data-reveal
            >
              <span className="label-sm nums w-6 shrink-0 self-start pt-[0.9em] text-mute md:w-10">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="min-w-0 flex-1 text-[clamp(2.75rem,0.9rem+6.6vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.06em]">
                {l(m.place)}
              </h3>
              <div className="w-full ps-[calc(1.5rem+var(--gutter))] max-md:order-last md:w-[clamp(14rem,20vw,20rem)] md:shrink-0 md:ps-0">
                <p className="label">{l(m.what)}</p>
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  {/* The country leads unless the place already is one. */}
                  {m.country.en !== m.place.en ? <><span className="text-ink">{l(m.country)}.</span>{' '}</> : null}
                  {l(m.detail)}
                </p>
              </div>
              <div className="w-14 shrink-0 md:w-[clamp(6.5rem,10vw,11rem)]">
                <div className="frame frame-4-5" data-reveal-img>
                  <Image src={`/img/${m.img}.webp`} alt={l(m.alt)} width={1400} height={1750} sizes="(min-width:768px) 11rem, 56px" />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid-page mt-[clamp(3.5rem,2rem+5vw,8rem)] gap-y-6">
          <p className="body-lg col-span-4 max-w-[34ch] text-ink-3 md:col-span-3 lg:col-span-4" data-reveal>
            {ar
              ? 'الكميات صغيرة — معظم القطع تُقصّ بالمئات القليلة، وقطع العروض بالعشرات.'
              : 'Counts are small — most pieces are cut in the low hundreds, runway pieces in the dozens.'}
          </p>
          <p className={`display-lg col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-5 ${LINE_ROOM}`}>
            <Lines text={ar ? 'حين تنفد الكمية، تنتهي.' : 'When a count is finished it is finished.'} />
          </p>
        </div>
      </section>

      {/* ─── 04 What we do not do — the graphite room ─────────────────── */}
      <section className="on-ink section-y bg-graphite text-bone" aria-labelledby="ch-not">
        <div className="page">
          <SectionHead index={4} title={ar ? 'ما لا نفعله' : 'What we do not do'} id="ch-not" tone="ink" />
          <ul className="mt-[clamp(2.5rem,1.5rem+4vw,6rem)] space-y-[clamp(0.5rem,0.25rem+1vw,1.25rem)]">
            {REFUSALS.map((r) => (
              <li key={r.en} className="max-w-[16ch] text-[clamp(2.25rem,0.8rem+5.6vw,7.25rem)] font-semibold leading-[0.96] tracking-[-0.05em]" data-reveal>
                <span className="sr-only">{ar ? 'لا ' : 'No '}</span>
                <Strike>{l(r)}</Strike>
              </li>
            ))}
          </ul>
          <div className="grid-page mt-[clamp(3rem,2rem+4vw,6rem)]">
            <p className="body-lg col-span-4 max-w-[44ch] text-bone/80 md:col-span-4 lg:col-span-5 lg:col-start-8" data-reveal>
              {ar
                ? 'تُحدَّد الأسعار مرة واحدة وتبقى ثابتة طوال عمر القطعة، والتخفيض الوحيد هو الذي يأتي في نهاية الموسم.'
                : 'Prices are set once and hold for the life of the piece, and the sale at the end of a season is the only one.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 05 This site ──────────────────────────────────────────────── */}
      <section className="page section-y" aria-labelledby="ch-site">
        <SectionHead index={5} title={ar ? 'هذا الموقع' : 'This site'} id="ch-site" tone="ink" note={ar ? 'مشروع تصوّري' : 'A concept'} />
        <div className="grid-page mt-[clamp(2.5rem,1.5rem+4vw,6rem)] items-start gap-y-10">
          <div className="col-span-2 md:col-span-2 lg:col-span-3" aria-hidden data-reveal-img>
            <div><Wordmark symbol className="h-auto w-full" /></div>
          </div>
          <div className="col-span-4 md:col-span-4 lg:col-span-8 lg:col-start-5">
            <p className="text-[clamp(1.375rem,1rem+1.5vw,2.625rem)] font-medium leading-[1.14] tracking-[-0.03em]" data-reveal>
              {ar ? (
                <>
                  ميرت علامة خيالية، بُنيت لتوضيح ما يمكن أن يكون عليه متجر أزياء إلكتروني. القطع والمصانع
                  والكميات والأسعار والمتاجر ومستويات المخزون هنا كلها مُختلَقة، والصور مؤقتة، ولا يمكن شراء
                  أي شيء.{' '}
                  <Link href="/stores" className="link-rule">والمتاجر</Link> غير موجودة هي الأخرى.
                </>
              ) : (
                <>
                  MERIT is a fictional label, built as a demonstration of what a fashion storefront can be.
                  The garments, mills, counts, prices, stores and stock levels here are invented, the
                  photography is placeholder, and nothing can be bought.{' '}
                  <Link href="/stores" className="link-rule">The stores</Link> do not exist either.
                </>
              )}
            </p>
            <div className="mt-10 flex flex-wrap gap-3" data-reveal>
              <Link href="/collections" className="btn btn-solid">
                {ar ? 'تصفّح المجموعات' : 'See the collections'} <Icon name="arrowR" className="h-3.5 w-3.5" />
              </Link>
              <Link href="/stores" className="btn">{ar ? 'الصالتان' : 'The two rooms'}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
