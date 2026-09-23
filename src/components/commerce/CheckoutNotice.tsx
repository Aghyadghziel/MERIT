'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Amount, LinePrice } from '@/components/commerce/CartView';
import { FREE_SHIPPING, useStore } from '@/components/providers/Store';
import { Wordmark } from '@/components/ui/Wordmark';
import { getProduct } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { plural } from '@/lib/format';
import { EASE, reduced, setupGsap } from '@/lib/gsap';

/** Today in Riyadh, whatever the reader's own clock says. */
const today = () =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Riyadh' }).format(new Date());

/**
 * The order that would have been placed, printed as a slip — and every line
 * that would make it real says plainly that it did not happen: no order
 * number, no payment, nothing charged. It feeds down out of the slot like
 * paper from a till — masked at the slot line, so it is never seen above it —
 * once, and simply sits there for anyone who prefers less motion.
 */
export function CheckoutNotice() {
  const { bag, subtotal, count, ready } = useStore();
  const slip = useRef<HTMLDivElement>(null);
  const [date] = useState(today);

  useLayoutEffect(() => {
    const el = slip.current;
    if (!ready || !el || reduced()) return;
    const { gsap } = setupGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { yPercent: -100 }, { yPercent: 0, duration: 1.5, delay: 0.45, ease: 'power3.out' });
      gsap.fromTo(
        '[data-slip-row]',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.45, delay: 0.75, stagger: 0.06, ease: EASE.ui },
      );
    }, el);
    return () => ctx.revert();
  }, [ready]);

  if (!ready) return <div className="min-h-[34rem]" aria-hidden />;

  const free = subtotal >= FREE_SHIPPING;

  return (
    <section aria-labelledby="slip-title">
      {/* The slot the slip feeds out of, and the mask under it: the paper
          only ever exists below the slot line. */}
      <div aria-hidden className="h-[3px] bg-ink/70" />

      <div className="overflow-hidden">
        <div ref={slip} className="text-ink">
          <div className="bg-bone">
            <div className="flex items-start justify-between gap-6 px-[clamp(1.25rem,0.9rem+1.2vw,2rem)] pt-[clamp(1.25rem,0.9rem+1.2vw,2rem)]">
              <Wordmark className="h-5 w-auto" />
              <div className="text-right">
                <h2 id="slip-title" className="label">Order slip</h2>
                <p className="label-sm nums mt-1.5 text-mute">{date} · Riyadh</p>
              </div>
            </div>

            <Perforation />

            <ul className="space-y-4 px-[clamp(1.25rem,0.9rem+1.2vw,2rem)] text-sm">
              {count === 0 ? (
                <li className="text-mute" data-slip-row>The bag is empty.</li>
              ) : (
                bag.map((line) => {
                  const p = getProduct(line.slug);
                  if (!p) return null;
                  return (
                    <li
                      key={`${line.slug}-${line.colour}-${line.size}`}
                      className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3"
                      data-slip-row
                    >
                      <span className="nums text-mute">{line.qty}×</span>
                      <span className="min-w-0">
                        <span className="block font-medium leading-snug">{p.name}</span>
                        <span className="label-sm mt-1 block text-mute">
                          {line.colour} · {line.size}
                        </span>
                      </span>
                      <LinePrice product={p} qty={line.qty} stack />
                    </li>
                  );
                })
              )}
            </ul>

            <Perforation />

            <dl className="space-y-2 px-[clamp(1.25rem,0.9rem+1.2vw,2rem)] text-sm">
              <SlipRow label={`Subtotal · ${plural(count, 'piece')}`}><Amount value={subtotal} /></SlipRow>
              <SlipRow label="Delivery">{count === 0 ? '—' : free ? 'Free in the Gulf' : 'Not calculated'}</SlipRow>
            </dl>

            <div className="mx-[clamp(1.25rem,0.9rem+1.2vw,2rem)] mt-5 border-t-2 border-ink" />

            <dl className="space-y-2 px-[clamp(1.25rem,0.9rem+1.2vw,2rem)] pt-5 text-sm">
              <SlipRow label="Order number">Not issued</SlipRow>
              <SlipRow label="Payment">Not connected</SlipRow>
              <SlipRow label="Shipping">Not scheduled</SlipRow>
            </dl>

            <div className="px-[clamp(1.25rem,0.9rem+1.2vw,2rem)] pb-[clamp(1.5rem,1rem+1.4vw,2.25rem)] pt-7" data-slip-row>
              <p className="label">Charged</p>
              <p className="mt-3 text-[clamp(3.25rem,2.2rem+3.2vw,5.5rem)] font-semibold leading-[0.84] tracking-[-0.06em]">
                <Amount value={0} />
              </p>
              <p className="mt-4 text-xs text-mute">
                Kept for reference only. Your bag has not been changed.
              </p>
            </div>
          </div>

          {/* A torn foot, so it reads as paper rather than a card. */}
          <div
            aria-hidden
            className="h-2.5"
            style={{
              background:
                'linear-gradient(135deg, var(--color-bone) 50%, transparent 50%) 0 0 / 12px 100%, linear-gradient(225deg, var(--color-bone) 50%, transparent 50%) 0 0 / 12px 100%',
            }}
          />
        </div>
      </div>
    </section>
  );
}

function SlipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4" data-slip-row>
      <dt className="text-mute">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function Perforation({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('relative my-5 h-px', className)}>
      <div className="mx-[clamp(1.25rem,0.9rem+1.2vw,2rem)] border-t border-dashed border-line-2" />
    </div>
  );
}
