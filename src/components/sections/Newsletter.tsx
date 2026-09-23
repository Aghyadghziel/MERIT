'use client';

import { useId, useState } from 'react';
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError('Enter an email address.');
      setState('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError('That does not look like an email address.');
      setState('error');
      return;
    }
    setError('');
    setState('done');
  };

  return (
    <section className="page grid-page section-y-sm gap-y-10" aria-labelledby={`${id}-title`}>
      <div className="col-span-4 md:col-span-6 lg:col-span-5">
        <p className="label-sm text-mute-ink">Newsletter</p>
        <h2 id={`${id}-title`} className="display-lg mt-4">Collection notes.</h2>
        <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-mute-ink">
          Four or five letters a year: what is being made, when it lands, and the counts. Nothing
          else.
        </p>
      </div>

      <div className="col-span-4 self-end md:col-span-6 lg:col-span-7 lg:col-start-6">
        {state === 'done' ? (
          <div className="flex items-start gap-4 border-b border-bone pb-5" role="status">
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
            <div className="group mt-2 flex items-center gap-4 border-b border-line-ink-2 transition-colors focus-within:border-bone">
              <input
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
                className="min-h-16 w-full min-w-0 flex-1 bg-transparent py-3 text-[clamp(1.5rem,1rem+2.2vw,2.75rem)] font-semibold tracking-[-0.035em] text-bone outline-none placeholder:text-mute-ink/70 md:min-h-20"
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
                'Unsubscribe in one click. See the privacy policy.'
              )}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
