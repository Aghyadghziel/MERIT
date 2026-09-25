import type { Metadata } from 'next';
import { getLocale, getT } from '@/i18n/server';
import Link from '@/i18n/link';
import { MaskHeadline } from '@/components/commerce/CartView';
import { CheckoutNotice, OrderActions } from '@/components/commerce/CheckoutNotice';
import { Icon } from '@/components/ui/Icon';

export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLocale()) === 'ar';
  return {
    title: ar ? 'كمّل الطلب' : 'Checkout',
    description: ar
      ? 'الدفع أونلاين قريب. أرسل لنا طلبك بالإيميل أو على إنستغرام.'
      : 'Online payment is coming soon. Send us your order by email or on Instagram.',
    robots: { index: false, follow: false },
  };
}

/**
 * Online payment is not open yet, so the page says so rather than imitating a
 * checkout, and turns the bag into a ready email instead. It is the one room
 * of the site set in graphite: the bag is left behind, the lights go down, and
 * the order slip lists what you are about to send.
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
            <p className="label text-mute-ink">{t('Payment coming soon')}</p>
          </div>

          <h1 id="checkout-title" className="display-xl mt-8 max-w-[11ch]">
            <MaskHeadline text={t('Order by message.')} />
          </h1>

          <p className="body-lg mt-10 max-w-[34rem] text-bone/85" data-reveal>
            {t('Online payment is coming soon. Until then, send us your order by email or on Instagram, and we will confirm the size, stock, price and delivery with you before anything is paid.')}
          </p>
          <p className="mt-5 max-w-[34rem] text-sm leading-relaxed text-mute-ink" data-reveal>
            {t('The email button writes the order for you: every piece in your bag, with its colour, size and price.')}
          </p>

          <div className="mt-10" data-reveal>
            <OrderActions />
          </div>

          <div className="mt-3 flex flex-wrap gap-3" data-reveal>
            <Link href="/cart" className="btn group">
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
