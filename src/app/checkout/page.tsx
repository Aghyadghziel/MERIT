import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutNotice } from '@/components/commerce/CheckoutNotice';
import { Icon } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

/**
 * There is no payment processor behind this and there never will be, so the
 * page says exactly that rather than imitating a checkout.
 */
export default function CheckoutPage() {
  return (
    <div className="page pt-(--nav-h)">
      <div className="grid-page section-y">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <p className="label text-mute">Checkout</p>
          <h1 className="display-lg mt-4">This is a concept site.</h1>
          <p className="body-lg mt-6 max-w-md text-mute">
            MERIT is not a real company. There is no payment processor connected to this page, no
            order will be placed, and nothing you have put in the bag will be charged or shipped.
          </p>
          <p className="mt-5 max-w-md text-sm text-mute">
            Everything else works as it would in a real store: the bag, the wishlist, the currency,
            the stock on each size. This is the one place where pretending would be dishonest.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/cart" className="btn btn-solid">
              <Icon name="arrowL" className="h-3.5 w-3.5" />
              Back to the bag
            </Link>
            <Link href="/new" className="btn">Keep looking</Link>
          </div>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
          <CheckoutNotice />
        </div>
      </div>
    </div>
  );
}
