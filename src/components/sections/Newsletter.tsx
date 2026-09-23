'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type State = 'idle' | 'error' | 'done';

/**
 * No popup, no discount, no countdown. The form validates on submit, tells you
 * what is wrong in words, and — because this is a concept site — says plainly
 * that nothing is sent anywhere.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');

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
    <section className="page grid-page section-y-sm" aria-labelledby="newsletter-title">
      <div className="col-span-4 md:col-span-6 lg:col-span-5">
        <h2 id="newsletter-title" className="display-md">Collection notes</h2>
        <p className="mt-3 max-w-sm text-sm text-mute-ink">
          Four or five letters a year: what is being made, when it lands, and the counts. Nothing
          else.
        </p>
      </div>

      <div className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7">
        {state === 'done' ? (
          <div className="rule-t flex items-start gap-3 pt-5" role="status">
            <Icon name="check" className="mt-1 h-4 w-4 shrink-0" />
            <p className="text-sm">
              Noted — <span className="text-mute-ink">{email}</span>. This is a concept site, so no
              address is stored and no letter will arrive.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="label-sm text-mute-ink">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                  aria-invalid={state === 'error'}
                  aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
                  placeholder="you@example.com"
                  className="field mt-1 border-line-ink text-bone placeholder:text-mute-ink focus:border-bone"
                />
              </div>
              <button type="submit" className="btn shrink-0">Subscribe</button>
            </div>
            {state === 'error' ? (
              <p id="newsletter-error" role="alert" className="mt-3 flex items-center gap-2 text-sm text-bone">
                <Icon name="alert" className="h-4 w-4 shrink-0" />
                {error}
              </p>
            ) : (
              <p className="mt-3 text-xs text-mute-ink">
                Unsubscribe in one click. See the privacy policy.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
