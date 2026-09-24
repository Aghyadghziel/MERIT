import type { Metadata } from 'next';
import { getLocale, getT } from '@/i18n/server';
import Link from '@/i18n/link';
import { MaskHeadline } from '@/components/commerce/CartView';
import { CheckoutNotice } from '@/components/commerce/CheckoutNotice';
import { Icon } from '@/components/ui/Icon';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'كمّل الطلب' : 'Checkout',
    description: ar
      ? 'ميرت موقع تجريبي. ما فيه بوابة دفع، وما تقدر تشتري شي.'
      : 'MERIT is a concept site. There is no payment processor, and nothing can be bought.',
    robots: { index: false, follow: false },
  };
}

/**
 * There is no payment processor behind this and there never will be, so the
 * page says exactly that rather than imitating a checkout. It is the one room
 * of the site set in graphite: the bag is left behind, the lights go down, and
 * the order slip shows what would have happened — and that none of it did.
 */
export default async function CheckoutPage() {
  const t = await getT();
  return (
    <section aria-labelledby="checkout-title" className="on-ink relative mt-(--nav-h) bg-graphite text-bone">
      <div className="page grid-page min-h-[calc(100svh-var(--nav-h))] content-start gap-y-14 pb-(--section) pt-[clamp(2.75rem,1rem+5vw,7rem)]">
        <div className="col-span-4 md:col-span-6 lg:col-span-7">
          <div className="flex items-center gap-4" data-reveal>
            <p className="label">{t('Checkout')}</p>
            <span aria-hidden className="h-px w-10 bg-line-ink-2" />
            <p className="label text-mute-ink">{t('A concept site')}</p>
          </div>

          <h1 id="checkout-title" className="display-xl mt-8 max-w-[11ch]">
            <MaskHeadline text={t('Nothing here can be bought.')} />
          </h1>

          <p className="body-lg mt-10 max-w-[34rem] text-bone/85" data-reveal>
            {t('MERIT is not a real company. There is no payment processor connected to this page, no order will be placed, and nothing you have put in the bag will be charged or shipped.')}
          </p>
          <p className="mt-5 max-w-[34rem] text-sm leading-relaxed text-mute-ink" data-reveal>
            {t('Everything else works as it would in a real store: the bag, the wishlist, the currency, the stock on each size. This is the one place where pretending would be dishonest.')}
          </p>

          <div className="mt-10 flex flex-wrap gap-3" data-reveal>
            <Link href="/cart" className="btn btn-solid group">
              <Icon name="arrowL" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
              {t('Back to the bag')}
            </Link>
            <Link href="/new" className="btn">{t('Keep looking')}</Link>
          </div>
        </div>

        <div className="col-span-4 md:col-span-4 md:col-start-2 lg:col-span-4 lg:col-start-9 lg:pt-3">
          <CheckoutNotice />
        </div>
      </div>
    </section>
  );
}
