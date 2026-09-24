import type { Metadata } from 'next';
import Link from '@/i18n/link';
import { Section, TextPage } from '@/components/layout/TextPage';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'دليل المقاسات' : 'Size guide',
    description: ar
      ? 'مقاسات ميرت للنساء والرجال والبناطيل والأحذية، بالسنتي والإنش.'
      : 'MERIT measurements for women, men, trousers and footwear, in centimetres and inches.',
    alternates: { canonical: ar ? '/ar/size-guide' : '/size-guide', languages: { en: '/size-guide', ar: '/ar/size-guide' } },
  };
}

/** Column heads per language; the figures in the rows never change. */
const HEAD = {
  women: { en: ['Size', 'Bust', 'Waist', 'Hip', 'UK', 'EU', 'US'], ar: ['المقاس', 'الصدر', 'الخصر', 'الورك', 'UK', 'EU', 'US'] },
  men: { en: ['Size', 'Chest', 'Waist', 'Neck', 'UK / US', 'EU'], ar: ['المقاس', 'الصدر', 'الخصر', 'الرقبة', 'UK / US', 'EU'] },
  trousers: {
    en: ['Waist size', 'Waist', 'Hip', 'Inside leg', 'Leg opening'],
    ar: ['مقاس الخصر', 'الخصر', 'الورك', 'طول الرجل من الداخل', 'فتحة الرجل'],
  },
};

type Chart = { head: string[]; rows: string[][]; measured: number[] };

const WOMEN: Chart = {
  head: ['Size', 'Bust', 'Waist', 'Hip', 'UK', 'EU', 'US'],
  measured: [1, 2, 3],
  rows: [
    ['XS', '80–84', '62–66', '88–92', '6–8', '34–36', '2–4'],
    ['S', '85–89', '67–71', '93–97', '10', '38', '6'],
    ['M', '90–94', '72–76', '98–102', '12', '40', '8'],
    ['L', '95–100', '77–82', '103–108', '14', '42', '10'],
    ['XL', '101–107', '83–89', '109–115', '16', '44', '12'],
  ],
};

const MEN: Chart = {
  head: ['Size', 'Chest', 'Waist', 'Neck', 'UK / US', 'EU'],
  measured: [1, 2, 3],
  rows: [
    ['44', '86–90', '74–78', '37', '34', '44'],
    ['46', '91–95', '79–83', '38', '36', '46'],
    ['48', '96–100', '84–88', '39', '38', '48'],
    ['50', '101–106', '89–94', '41', '40', '50'],
    ['52', '107–112', '95–100', '42', '42', '52'],
  ],
};

const TROUSERS: Chart = {
  head: ['Waist size', 'Waist', 'Hip', 'Inside leg', 'Leg opening'],
  measured: [1, 2, 3, 4],
  rows: [
    ['26', '66', '92', '82', '26'],
    ['28', '71', '97', '82', '26.5'],
    ['30', '76', '102', '83', '27'],
    ['32', '81', '107', '84', '27.5'],
    ['34', '86', '112', '84', '28'],
  ],
};

const MEASURE = {
  en: [
    ['Chest and bust', 'Around the fullest part, tape level under the arms, arms down.'],
    ['Waist', 'The narrowest part, usually just above the navel. Do not pull the tape tight.'],
    ['Hip', 'Around the fullest part, roughly twenty centimetres below the waist.'],
    ['Inside leg', 'From the crotch seam of a trouser that fits you, down the inside of the leg to the hem.'],
  ],
  ar: [
    ['الصدر', 'حول أعرض مكان فيه، وخلّ الشريط مستوي تحت الإبط ويدينك نازلة.'],
    ['الخصر', 'عند أضيق مكان، وغالبًا فوق السرة على طول. لا تشد الشريط.'],
    ['الورك', 'حول أعرض مكان فيه، تقريبًا عشرين سنتي تحت الخصر.'],
    ['طول الرجل من الداخل', 'من درزة الوسط في بنطلون جاي عليك، نازل على الجهة الداخلية للرجل لين الطرف.'],
  ],
};

/** Centimetres to inches, to the nearest half inch — the precision a tape gives. */
const toInches = (cm: string) =>
  cm.replace(/\d+(?:\.\d+)?/g, (n) => String(Math.round((Number(n) / 2.54) * 2) / 2));

/**
 * The unit switch is two radio buttons and a :has() rule on the document — no
 * script. Every measured cell is rendered with both figures and the one not
 * chosen is hidden, so the switch can sit in the sticky margin, far from the
 * tables it drives, and stay in reach while they are read.
 */
const CM = '[html:has(#unit-in:checked)_&]:hidden';
const IN = '[html:not(:has(#unit-in:checked))_&]:hidden';

function Units({ ar }: { ar: boolean }) {
  const units = ar ? 'الوحدات' : 'Units';
  return (
    <fieldset className="border-t border-ink pt-5 lg:border-line">
      <legend className="sr-only">{units}</legend>
      <p aria-hidden className="label-sm text-mute">{units}</p>
      <div className="mt-3 grid grid-cols-2">
        {[['unit-cm', ar ? 'سنتيمتر' : 'Centimetres'], ['unit-in', ar ? 'إنش' : 'Inches']].map(([id, label], i) => (
          <label
            key={id}
            htmlFor={id}
            className="label relative inline-flex min-h-11 cursor-pointer items-center justify-center border border-ink px-3 transition-colors duration-200 first:border-e-0 hover:bg-bone-2 has-[:checked]:bg-ink has-[:checked]:text-bone has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink"
          >
            <input id={id} type="radio" name="unit" defaultChecked={i === 0} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function SizeGuidePage() {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const l = (en: string, a: string) => (ar ? a : en);
  return (
    <TextPage
      eyebrow={l('Measurements', 'القياسات')}
      title={l('Size guide.', 'دليل المقاسات.')}
      standfirst={l('Every figure below is taken from the finished garment, not from a body.', 'كل رقم تحت مأخوذ من القطعة بعد ما خلصت، مو من الجسم.')}
      toc={[
        { id: 'women', label: l('Women', 'النساء') },
        { id: 'men', label: l('Men', 'الرجال') },
        { id: 'trousers', label: l('Trousers', 'البناطيل') },
        { id: 'footwear', label: l('Footwear', 'الأحذية') },
        { id: 'measure', label: l('How to measure', 'طريقة القياس') },
      ]}
      aside={<Units ar={ar} />}
    >
      <Table ar={ar} id="women" title={l('Women', 'النساء')} caption={l('Ready to wear, sizes XS to XL.', 'ملابس جاهزة، من XS لين XL.')} chart={{ ...WOMEN, head: HEAD.women[locale] }} />
      <Table ar={ar} id="men" title={l('Men', 'الرجال')} caption={l('Tailoring and outerwear, sizes 44 to 52.', 'التفصيل والمعاطف، من 44 لين 52.')} chart={{ ...MEN, head: HEAD.men[locale] }} />
      <Table
        ar={ar}
        id="trousers"
        title={l('Trousers', 'البناطيل')}
        caption={l(
          'Waist sizes are in inches, taken from the finished waistband. Inside leg is before any alteration.',
          'مقاسات الخصر بالإنش، مأخوذة من الحزام بعد ما خلص. وطول الرجل من الداخل قبل أي تعديل.',
        )}
        chart={{ ...TROUSERS, head: HEAD.trousers[locale] }}
      />

      <Section id="footwear" title={l('Footwear', 'الأحذية')}>
        <p>
          {l(
            'Sized in EU, running true on a standard width. The Pivot mule is cut on a square last and reads a half size small across the toe; take the next size up if your foot is wide. The Plinth derby runs true.',
            'المقاسات أوروبية (EU)، ومقاسك العادي على عرض عادي. حذاء ارتكاز المفتوح من ورا مسوّى على قالب مربّع، ويجي أصغر بنص مقاس عند مقدمة الرجل، فإذا رجلك عريضة خذ المقاس اللي بعده. أما حذاء قاعدة الديربي فمقاسك نفسه.',
          )}
        </p>
      </Section>

      <Section id="measure" title={l('How to measure', 'طريقة القياس')} plain>
        <ol className="grid gap-x-(--gutter) border-t border-ink sm:grid-cols-2">
          {MEASURE[locale].map(([k, v], i) => (
            <li key={k} className="border-b border-line py-6">
              <span className="label-sm nums text-mute">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-3 text-[clamp(1.125rem,1rem+0.45vw,1.375rem)] font-semibold tracking-[-0.02em]">{k}</p>
              <p className="mt-2 max-w-[36ch] text-[clamp(1rem,0.96rem+0.2vw,1.0625rem)] leading-[1.65] text-ink-3">{v}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-[56ch] text-sm leading-relaxed text-mute">
          {ar ? (
            <>
              محتار بين مقاسين، أو مو متأكد من قطعة معيّنة؟{' '}
              <Link href="/contact" className="link-rule text-ink">راسل خدمة العملاء</Link> بمقاساتك واسم
              القطعة، ونقول لك وش المقاس اللي يناسبك.
            </>
          ) : (
            <>
              Between two sizes, or unsure about a particular piece?{' '}
              <Link href="/contact" className="link-rule text-ink">Write to client care</Link> with your
              measurements and the piece, and we will tell you which to take.
            </>
          )}
        </p>
      </Section>
    </TextPage>
  );
}

function Table({ ar, id, title, caption, chart }: { ar: boolean; id: string; title: string; caption: string; chart: Chart }) {
  const { head, rows, measured } = chart;
  return (
    <Section id={id} title={title} plain>
      <p className="-mt-4 mb-6 max-w-[56ch] text-sm leading-relaxed text-mute">
        {ar ? (
          <>{caption} المقاسات تحت بـ<span className={CM}>السنتي</span><span className={IN}>الإنش</span>.</>
        ) : (
          <>{caption} The measurements below are in <span className={CM}>centimetres</span><span className={IN}>inches</span>.</>
        )}
      </p>
      <div className="no-bar relative -mx-(--gutter) overflow-x-auto px-(--gutter) md:mx-0 md:px-0">
        <table className="w-full min-w-[34rem] border-collapse text-start">
          <caption className="sr-only">{title}: {caption}</caption>
          <thead>
            <tr className="border-y border-ink">
              {head.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`label-sm py-3.5 pe-4 text-start font-semibold text-mute ${i === 0 ? 'sticky start-0 z-10 bg-bone' : ''}`}
                >
                  {h}
                  {measured.includes(i) ? <span className="ms-1 normal-case tracking-normal"><span className={CM}>{ar ? '(سم)' : '(cm)'}</span><span className={IN}>{ar ? '(إنش)' : '(in)'}</span></span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="nums">
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-line transition-colors duration-200 hover:bg-bone-2">
                {r.map((cell, i) =>
                  i === 0 ? (
                    <th
                      key={i}
                      scope="row"
                      className="sticky start-0 z-10 bg-bone py-4 pe-4 text-start text-[clamp(1.0625rem,1rem+0.3vw,1.25rem)] font-semibold tracking-[-0.02em] [tr:hover_&]:bg-bone-2"
                    >
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="whitespace-nowrap py-4 pe-4 text-[0.9375rem] text-ink-3">
                      {measured.includes(i) ? (
                        <>
                          <span dir="ltr" className={CM}>{cell}</span>
                          <span dir="ltr" className={IN}>{toInches(cell)}</span>
                        </>
                      ) : <span dir="ltr">{cell}</span>}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="label-sm mt-3 text-mute md:hidden">{ar ? 'اسحب الجدول عشان تشوف كل الأعمدة' : 'Swipe the table for every column'}</p>
    </Section>
  );
}
