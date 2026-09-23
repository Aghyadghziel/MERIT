'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MaskHeadline, Tally } from '@/components/commerce/CartView';
import { useStore } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { cn } from '@/lib/cn';
import { plural } from '@/lib/format';

/**
 * There is no authentication behind this and no orders to show. The form
 * validates like a real one and then says so, rather than spinning forever or
 * inventing an order history — and a quiet line under the button says it
 * before anyone types a thing.
 */
export function AccountView() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const returning = useRef(false);
  const { wishlist, count, ready } = useStore();

  // Move the reader to whatever just replaced the thing they used.
  useEffect(() => {
    if (sentTo) status.current?.focus();
    else if (returning.current) field.current?.focus();
    returning.current = false;
  }, [sentTo]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(value ? 'That address is missing something. Check it and try again.' : 'Enter your email address.');
      field.current?.focus();
      return;
    }
    setError('');
    setSentTo(value);
  };

  const back = () => {
    returning.current = true;
    setSentTo(null);
  };

  const bag = ready ? count : 0;
  const saved = ready ? wishlist.length : 0;

  return (
    <div className="pt-(--nav-h)">
      <div className="grid lg:min-h-[calc(100svh-var(--nav-h))] lg:grid-cols-2">
        {/* The atelier, full bleed to the left edge. */}
        <figure className="relative h-[clamp(15rem,44svh,26rem)] overflow-hidden bg-bone-2 lg:sticky lg:top-(--nav-h) lg:h-[calc(100svh-var(--nav-h))]">
          <div data-reveal-img className="absolute inset-0">
            <div className="absolute inset-0">
              <Image
                src="/img/atelier-basting.webp"
                alt="A navy jacket on a tailor's dummy, basted in white thread before its first fitting"
                fill
                priority
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-cover object-[50%_30%]"
              />
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-(--gutter) pb-[clamp(1.25rem,1rem+1.2vw,2.25rem)] text-bone">
            <Wordmark symbol className="h-[clamp(2.25rem,1.5rem+2.4vw,4.5rem)] w-auto" />
            <span className="label-sm max-w-[16rem] text-right text-bone/85">Basted, before the first fitting</span>
          </figcaption>
        </figure>

        <div className="flex flex-col px-(--gutter) pb-[clamp(3rem,2rem+4vw,6rem)] pt-[clamp(2.5rem,1.5rem+4vw,6.5rem)] lg:px-[clamp(2.5rem,0.5rem+4.5vw,7rem)]">
          <div className="flex items-baseline justify-between gap-4" data-reveal>
            <p className="label">Account</p>
            <p className="label text-mute">Not connected</p>
          </div>

          <h1 className="mt-6 text-[clamp(3.25rem,1rem+7.5vw,8.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
            <MaskHeadline text={sentTo ? 'No accounts.' : 'Sign in.'} />
          </h1>

          <div className="mt-[clamp(2rem,1.5rem+2vw,3.5rem)] max-w-[26rem]">
            {sentTo ? (
              <div>
                <p ref={status} tabIndex={-1} className="display-sm" style={{ outline: 'none' }}>
                  Nothing was sent to <span className="[overflow-wrap:anywhere]">{sentTo}</span>.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-mute">
                  MERIT is a concept site with no sign-in and no order history. Your bag and wishlist
                  are kept in this browser instead, and they survive a reload without an account.
                </p>
                <button type="button" className="btn btn-ghost group mt-8" onClick={back}>
                  <Icon name="arrowL" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  Use another address
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate data-reveal>
                <label htmlFor="account-email" className="label-sm text-mute">Email address</label>
                <input
                  ref={field}
                  id="account-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'account-error' : 'account-note'}
                  // The field's own focus is its inset ink underline. The
                  // site-wide :focus-visible ring is unlayered and would
                  // otherwise box the hairline field and cut through its label.
                  className="field focus-visible:outline-none!"
                  placeholder="you@example.com"
                />
                {error ? (
                  <p id="account-error" role="alert" className="mt-2.5 flex items-center gap-2 text-sm text-oxide">
                    <Icon name="alert" className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                ) : null}
                <button type="submit" className="btn btn-solid group mt-7 w-full justify-between px-5">
                  <span>Continue</span>
                  <Icon name="arrowR" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p id="account-note" className="mt-4 text-xs leading-relaxed text-mute">
                  Accounts are not connected on this concept site: no code is sent, and nothing is
                  stored beyond this browser.
                </p>
              </form>
            )}
          </div>

          <section aria-labelledby="device-title" className="mt-auto pt-[clamp(3.5rem,2rem+5vw,7rem)]">
            <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3" data-reveal>
              <h2 id="device-title" className="label">On this device</h2>
              <p className="label-sm text-mute">No account needed</p>
            </div>
            <ul className="grid grid-cols-3" data-reveal>
              <DeviceCell href="/cart" value={bag} label="Bag" aria={`Shopping bag, ${plural(bag, 'piece')}`} />
              <DeviceCell href="/wishlist" value={saved} label="Saved" aria={`Wishlist, ${plural(saved, 'piece')} saved`} />
              <DeviceCell value={0} label="Orders" note="Concept site" />
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function DeviceCell({
  href, value, label, aria, note,
}: { href?: string; value: number; label: string; aria?: string; note?: string }) {
  const figure = (
    <Tally
      value={value}
      className={cn(
        'text-[clamp(2.75rem,1.4rem+4.2vw,5.75rem)] font-semibold leading-[0.84] tracking-[-0.055em]',
        value === 0 ? 'text-line-2' : 'text-ink',
      )}
    />
  );
  const body = (
    <>
      {figure}
      <span className="label mt-3 flex items-center gap-2">
        {label}
        {href ? <Icon name="arrowR" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" /> : null}
      </span>
      {note ? <span className="label-sm mt-1.5 block text-mute">{note}</span> : null}
    </>
  );
  return (
    <li className="border-r border-line last:border-r-0 [&:not(:first-child)]:pl-[clamp(0.75rem,0.4rem+1.2vw,1.75rem)]">
      {href ? (
        <Link href={href} className="group block pb-2 pr-3 pt-5" aria-label={aria}>{body}</Link>
      ) : (
        <div className="pb-2 pr-3 pt-5">
          <span className="sr-only">Orders: none, as nothing can be bought on this concept site.</span>
          <span aria-hidden>{body}</span>
        </div>
      )}
    </li>
  );
}
