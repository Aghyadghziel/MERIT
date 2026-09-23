'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { plural } from '@/lib/format';

/**
 * There is no authentication behind this and no orders to show. The form
 * validates like a real one and then says so, rather than spinning forever or
 * inventing an order history.
 */
export function AccountView() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [explained, setExplained] = useState(false);
  const { wishlist, count, ready } = useStore();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter the email address you ordered with.');
      return;
    }
    setError('');
    setExplained(true);
  };

  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm max-w-3xl">
        <p className="label text-mute" data-reveal>Account</p>
        <h1 className="display-lg mt-4"><Lines text="Sign in." /></h1>
      </header>

      <div className="grid-page rule-t pb-(--section) pt-10">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          {explained ? (
            <div role="status">
              <p className="display-sm">There are no accounts here.</p>
              <p className="mt-4 max-w-sm text-sm text-mute">
                MERIT is a concept site with no authentication and no order history. Your bag and
                wishlist are kept in this browser instead, and they survive a reload without an
                account.
              </p>
              <button type="button" className="btn btn-ghost mt-8" onClick={() => setExplained(false)}>
                Back
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="max-w-sm">
              <label htmlFor="account-email" className="label-sm text-mute">Email address</label>
              <input
                id="account-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                aria-invalid={!!error}
                aria-describedby={error ? 'account-error' : undefined}
                className="field"
                placeholder="you@example.com"
              />
              {error ? (
                <p id="account-error" role="alert" className="mt-2 flex items-center gap-2 text-sm text-oxide">
                  <Icon name="alert" className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              ) : (
                <p className="mt-3 text-xs text-mute">
                  We send a one-time code rather than asking for a password.
                </p>
              )}
              <button type="submit" className="btn btn-solid mt-7 w-full">Continue</button>
            </form>
          )}
        </div>

        <div className="col-span-4 mt-12 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
          <h2 className="label rule-t pt-4">On this device</h2>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <Link href="/cart" className="link-rule inline-flex items-center gap-2.5">
                <Icon name="bag" className="h-4 w-4" /> Shopping bag
              </Link>
              <span className="nums text-mute">{ready ? count : 0}</span>
            </li>
            <li className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <Link href="/wishlist" className="link-rule inline-flex items-center gap-2.5">
                <Icon name="heart" className="h-4 w-4" /> Wishlist
              </Link>
              <span className="nums text-mute">{ready ? wishlist.length : 0}</span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2.5 text-mute">
                <Icon name="truck" className="h-4 w-4" /> Orders
              </span>
              <span className="text-mute">None</span>
            </li>
          </ul>
          <p className="mt-6 text-xs text-mute">
            {ready && (count > 0 || wishlist.length > 0)
              ? `${plural(count, 'piece')} in the bag, ${plural(wishlist.length, 'piece')} saved.`
              : 'Nothing saved on this device yet.'}
          </p>
        </div>
      </div>
    </div>
  );
}
