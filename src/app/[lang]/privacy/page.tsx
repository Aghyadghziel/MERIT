import type { Metadata } from 'next';
import { Section, TextPage } from '@/components/layout/TextPage';
import { getLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'سياسة الخصوصية' : 'Privacy policy',
    description: ar
      ? 'ما الذي تحفظه MERIT، وما لا تحفظه، وكيف تطلب استعادته.'
      : 'What MERIT stores, what it does not, and how to ask for it back.',
    alternates: { canonical: ar ? '/ar/privacy' : '/privacy', languages: { en: '/privacy', ar: '/ar/privacy' } },
  };
}

/**
 * Every key this site writes to local storage, and what is in it. Check this
 * list against the code (`grep -rn "'merit:" src`) whenever a feature starts
 * remembering something: the count at the top of the page is taken from it.
 */
const KEYS = [
  {
    key: 'merit:v1',
    holds: {
      en: 'Your bag, your wishlist, the last eight pieces you opened, and your chosen currency.',
      ar: 'حقيبتك، وقائمة أمنياتك، وآخر ثماني قطع فتحتها، والعملة التي اخترتها.',
    },
  },
  {
    key: 'merit:searches',
    holds: { en: 'Your last six searches.', ar: 'آخر ست عمليات بحث أجريتها.' },
  },
  {
    key: 'merit:grid',
    holds: {
      en: 'Whether you chose the large or the compact grid on a listing. Written only once you change it.',
      ar: 'اختيارك بين الشبكة الكبيرة والشبكة المضغوطة في صفحات عرض القطع. لا يُكتب إلا بعد أن تغيّره.',
    },
  },
  {
    key: 'merit:fitting-room',
    holds: {
      en: 'That you have taken a jacket down in the fitting room on the home page, so the jackets stop swaying to show you how.',
      ar: 'أنك أنزلت سترة في غرفة القياس على الصفحة الرئيسية، حتى تتوقف السترات عن التمايل لتريك الطريقة.',
    },
  },
];

const IDS = ['keeps', 'cookies', 'forms', 'real', 'images'] as const;

const COPY = {
  en: {
    eyebrow: 'Legal',
    title: 'Privacy policy.',
    standfirst: 'MERIT is a concept site. Nothing you type here is transmitted anywhere, and nothing is stored on a server, because there is no server behind it.',
    facts: [
      { label: 'Cookies', value: '0', note: 'None set, by us or anyone else.' },
      { label: 'Tracking scripts', value: '0', note: 'No analytics, no advertising pixels.' },
      { label: 'Kept in your browser', value: String(KEYS.length), unit: 'keys', note: 'Local storage only. Never sent.' },
      { label: 'Forms that send', value: '0', note: 'Nothing typed here leaves the page.' },
    ],
    toc: ['What this site keeps', 'Cookies', 'Forms', 'What a real version would say', 'Images'],
  },
  ar: {
    eyebrow: 'الشؤون القانونية',
    title: 'سياسة الخصوصية.',
    standfirst: 'MERIT موقع تصوّري. لا يُرسَل أي شيء تكتبه هنا إلى أي جهة، ولا يُحفظ شيء على خادم، لأنه لا يوجد خادم خلف هذا الموقع.',
    facts: [
      { label: 'ملفات تعريف الارتباط', value: '0', note: 'لا شيء، لا منّا ولا من غيرنا.' },
      { label: 'نصوص التتبّع', value: '0', note: 'لا أدوات تحليل، ولا وحدات بكسل إعلانية.' },
      // Every count this key list is likely to reach (3–10) takes the plural form.
      { label: 'محفوظ في متصفحك', value: String(KEYS.length), unit: 'مفاتيح', note: 'في التخزين المحلي فقط. لا يُرسَل أبدًا.' },
      { label: 'نماذج تُرسِل', value: '0', note: 'لا شيء مما تكتبه هنا يغادر الصفحة.' },
    ],
    toc: ['ما يحفظه هذا الموقع', 'ملفات تعريف الارتباط', 'النماذج', 'ما كانت ستقوله النسخة الحقيقية', 'الصور'],
  },
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const c = COPY[locale];
  const title = (n: number) => c.toc[n];

  const keys = (
    <dl className="border-t border-line">
      {KEYS.map((k) => (
        <div key={k.key} className="grid gap-x-6 gap-y-1.5 border-b border-line py-4 last:border-b-0 last:pb-0 sm:grid-cols-[11.5rem_minmax(0,1fr)]">
          <dt><code dir="ltr">{k.key}</code></dt>
          <dd>{k.holds[locale]}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <TextPage
      eyebrow={c.eyebrow}
      title={c.title}
      standfirst={c.standfirst}
      facts={c.facts}
      toc={IDS.map((id, n) => ({ id, label: c.toc[n] }))}
    >
      {ar ? (
        <>
          <Section id="keeps" title={title(0)}>
            <p>
              تُكتب بعض البيانات في التخزين المحلي لمتصفحك أنت، تحت المفاتيح المذكورة أدناه. لا تغادر هذه
              البيانات جهازك أبدًا، ومسح بيانات المتصفح يحذفها نهائيًا.
            </p>
            {keys}
          </Section>

          <Section id="cookies" title={title(1)}>
            <p>
              لا شيء. لا توجد في هذا الموقع أي أدوات تحليل، ولا وحدات بكسل إعلانية، ولا شريط لطلب الموافقة،
              ولا أي نص برمجي تابع لطرف ثالث من أي نوع. التخزين الوحيد المستخدم هو التخزين المحلي الموصوف
              أعلاه، وهو ليس ملف تعريف ارتباط ولا يُرسَل مع الطلبات.
            </p>
          </Section>

          <Section id="forms" title={title(2)}>
            <p>
              يتحقق نموذج النشرة البريدية ونموذج التواصل مما تكتبه، ثم يخبرانك صراحةً بأن شيئًا لم يُرسَل.
              ولا يُسجَّل أي عنوان.
            </p>
          </Section>

          <Section id="real" title={title(3)}>
            <p>
              كانت النسخة الحقيقية من MERIT ستعالج بيانات الطلب والتوصيل لتنفيذ عمليات الشراء، وتحتفظ بها
              للمدة التي تفرضها الأنظمة التجارية في المملكة العربية السعودية، ولا تشاركها إلا مع مزوّد خدمة
              الدفع وشركة الشحن. وكانت ستستجيب لطلبات الاطلاع على البيانات وحذفها خلال ثلاثين يومًا، ولن تبيع
              بيانات العملاء أبدًا.
            </p>
            <p>كُتبت هذه الفقرة هنا ليكون الإغفال ظاهرًا لا عَرَضيًا.</p>
          </Section>

          <Section id="images" title={title(4)}>
            <p>
              الصور في هذا الموقع مواد مؤقتة من Unsplash، مستخدمة بموجب ترخيص Unsplash. الأشخاص الظاهرون
              فيها لا صلة لهم بـ MERIT ولا يؤيدونها. المصادر مدرجة في{' '}
              <code dir="ltr">public/img/CREDITS.md</code>.
            </p>
          </Section>
        </>
      ) : (
        <>
          <Section id="keeps" title={title(0)}>
            <p>
              A few things are written to your own browser&rsquo;s local storage, under the keys below.
              They never leave the device, and clearing your browser data removes them for good.
            </p>
            {keys}
          </Section>

          <Section id="cookies" title={title(1)}>
            <p>
              None. There is no analytics, no advertising pixel, no consent banner and no third-party
              script of any kind on this site. The only storage used is the local storage described
              above, which is not a cookie and is not sent with requests.
            </p>
          </Section>

          <Section id="forms" title={title(2)}>
            <p>
              The newsletter form and the contact form validate what you type and then tell you plainly
              that nothing was sent. No address is recorded.
            </p>
          </Section>

          <Section id="real" title={title(3)}>
            <p>
              A live MERIT would process order and delivery details to fulfil purchases, hold them for the
              period required by Saudi commercial law, and share them only with the payment processor and
              the courier. It would answer access and deletion requests within thirty days and would never
              sell customer data.
            </p>
            <p>That paragraph is written here so the omission is visible rather than accidental.</p>
          </Section>

          <Section id="images" title={title(4)}>
            <p>
              The photography on this site is placeholder material from Unsplash, used under the Unsplash
              Licence. The people in it are not associated with MERIT and do not endorse it. Sources are
              listed in <code>public/img/CREDITS.md</code>.
            </p>
          </Section>
        </>
      )}
    </TextPage>
  );
}
