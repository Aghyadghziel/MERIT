'use client';

import Link from '@/i18n/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type State = 'idle' | 'error' | 'done';

/**
 * No popup, no discount, no countdown. One line, set large, at the top of the
 * black footer: the address is typed at display size on a single rule, and the
 * arrow at the end of the rule sends it. It validates on submit, says what is
 * wrong in words, and — because this is a concept site — says plainly that
 * nothing is sent anywhere.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const id = useId();
  const input = `${id}-email`;
  const hint = `${id}-hint`;
  const field = useRef<HTMLInputElement>(null);
  const done = useRef<HTMLDivElement>(null);

  // The form unmounts on success, so focus moves to the message that replaces
  // it rather than falling back to the page.
  useEffect(() => {
    if (state === 'done') done.current?.focus();
  }, [state]);

  const fail = (message: string) => {
    setError(message);
    setState('error');
    // Straight back to the field that needs the correction.
    field.current?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return fail('Enter an email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return fail('That does not look like an email address.');
    setError('');
    setState('done');
  };

  return (
    <section className="page grid-page gap-y-6 py-10 md:py-12" aria-labelledby={`${id}-title`}>
      <div className="col-span-4 md:col-span-6 lg:col-span-5">
        <p className="label-sm text-mute-ink">Newsletter</p>
        <h2 id={`${id}-title`} className="display-sm mt-3">Collection notes.</h2>
        <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-mute-ink">
          Four or five letters a year: what is being made, when it lands, and the counts. Nothing
          else.
        </p>
      </div>

      <div className="col-span-4 self-end md:col-span-6 lg:col-span-7 lg:col-start-6">
        {state === 'done' ? (
          <div ref={done} tabIndex={-1} className="flex items-start gap-4 border-b border-bone pb-5 outline-offset-8" role="status">
            <Icon name="check" className="mt-2 h-5 w-5 shrink-0" />
            <p className="display-sm">
              Noted — <span className="break-all text-mute-ink">{email.trim()}</span>.
              <span className="mt-2 block text-sm leading-relaxed text-mute-ink">
                This is a concept site, so no address is stored and no letter will arrive.
              </span>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <label htmlFor={input} className="label-sm text-mute-ink">Email address</label>
            {/* The rule is the field. Focus in the address thickens it to a bone
                line two pixels deep instead of boxing the display-size type. */}
            <div className="group mt-2 flex items-center gap-4 border-b border-line-ink-2 transition-[border-color,box-shadow] has-[input:focus-visible]:border-bone has-[input:focus-visible]:shadow-[inset_0_-1px_0_var(--color-bone)]">
              <input
                ref={field}
                id={input}
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                aria-invalid={state === 'error'}
                aria-describedby={hint}
                placeholder="you@example.com"
                className="min-h-12 w-full min-w-0 flex-1 bg-transparent py-2 text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] font-semibold tracking-[-0.035em] text-bone outline-none! placeholder:text-mute-ink/70"
              />
              <button
                type="submit"
                className="label-sm inline-flex min-h-12 shrink-0 items-center gap-3 px-1 text-bone transition-opacity hover:opacity-70"
              >
                <span className="hidden sm:inline">Subscribe</span>
                <span className="sr-only sm:hidden">Subscribe</span>
                <span className="inline-flex h-11 w-11 items-center justify-center border border-bone transition-colors group-focus-within:bg-bone group-focus-within:text-ink">
                  <Icon name="arrowR" className="h-4 w-4" />
                </span>
              </button>
            </div>
            <p id={hint} role={state === 'error' ? 'alert' : undefined}
              className="mt-3 flex items-center gap-2 text-xs text-mute-ink">
              {state === 'error' ? (
                <>
                  <Icon name="alert" className="h-4 w-4 shrink-0 text-bone" />
                  <span className="text-sm text-bone">{error}</span>
                </>
              ) : (
                <span>
                  Unsubscribe in one click. See the{' '}
                  <Link href="/privacy" className="text-bone underline decoration-line-ink-2 underline-offset-4 transition-colors hover:decoration-bone">
                    privacy policy
                  </Link>.
                </span>
              )}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
