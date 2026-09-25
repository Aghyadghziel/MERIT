'use client';

import Link from '@/i18n/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useLocale, useT } from '@/i18n/client';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';

type Key = 'name' | 'email' | 'message';
type Errors = Partial<Record<Key, string>>;

const SUBJECTS = ['An order', 'Sizing and fit', 'Alterations', 'An appointment', 'Press', 'Something else'];
const EMPTY = { name: '', email: '', subject: SUBJECTS[0], message: '' };
const MIN = 10;

/** "12 characters", with the Arabic count agreeing with its number. */
function characters(n: number, ar: boolean) {
  if (!ar) return `${n} ${n === 1 ? 'character' : 'characters'}`;
  if (n === 1) return 'حرف واحد';
  if (n === 2) return 'حرفين';
  if (n % 100 >= 3 && n % 100 <= 10) return `${n} أحرف`;
  return `${n} ${n % 100 >= 11 ? 'حرفًا' : 'حرف'}`;
}

/**
 * Validated properly, then handed to the reader's own email app as a ready
 * message to MERIT: the site has no mail server, so it never pretends to send.
 *
 * Four numbered lines, set large, with the subject as a row of choices rather
 * than a menu — one tap instead of three on a phone. On a failed submit the
 * first field that needs attention takes focus; on success the thank-you does.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const done = useRef<HTMLParagraphElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const t = useT();
  const ar = useLocale() === 'ar';

  useEffect(() => { if (sent) done.current?.focus(); }, [sent]);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = t('Tell us who you are.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = t('We need a working email address to reply to.');
    if (values.message.trim().length < MIN) next.message = t('A sentence or two, so we can answer properly.');
    setErrors(next);
    const first = (['name', 'email', 'message'] as Key[]).find((k) => next[k]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
      return;
    }
    const body = `${values.message.trim()}\n\n${values.name.trim()}\n${values.email.trim()}`;
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(`${t(values.subject)} — MERIT`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border-t border-ink pt-8" role="status">
        <p className="label-sm text-mute">{t('Almost sent')}</p>
        <p ref={done} tabIndex={-1} className="display-lg mt-6 outline-none">
          {t('Thank you, {name}.', { name: values.name.trim().split(/\s+/)[0] })}
        </p>
        <p className="body-lg mt-6 max-w-[46ch] text-ink-3">
          {t('Your email app should now be open with the message ready. Press send there. If it did not open, write to us at {email}.', { email: BRAND.email })}
        </p>
        <button
          type="button"
          className="btn btn-ghost mt-10"
          onClick={() => { setSent(false); setValues(EMPTY); setErrors({}); }}
        >
          {t('Write another')}
        </button>
      </div>
    );
  }

  const count = values.message.trim().length;

  return (
    <form ref={form} onSubmit={submit} noValidate aria-label={t('Write to client care')} className="border-t border-ink">
      <Field n={1} id="contact-name" label={t('Your name')} error={errors.name}>
        <input
          id="contact-name" value={values.name} onChange={set('name')} autoComplete="name" placeholder={t('First and last name')}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={INPUT}
        />
      </Field>

      <Field n={2} id="contact-email" label={t('Email')} error={errors.email}>
        <input
          id="contact-email" type="email" inputMode="email" dir="ltr" value={values.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com"
          aria-invalid={!!errors.email} aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={cn(INPUT, 'rtl:text-right')}
        />
      </Field>

      <fieldset className="border-b border-line py-6 sm:py-7">
        <legend className="sr-only">{t('What is it about?')}</legend>
        <div className="grid gap-x-(--gutter) gap-y-4 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
          <p aria-hidden className="label-sm flex items-baseline gap-3 pt-1 text-mute sm:pt-3.5">
            <span className="nums">03</span>{ar ? 'الموضوع' : 'About'}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <label
                key={s}
                className={cn(
                  'label relative inline-flex min-h-11 cursor-pointer items-center border px-4 transition-colors duration-200',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink',
                  values.subject === s ? 'border-ink bg-ink text-bone' : 'border-line-2 hover:border-ink',
                )}
              >
                <input
                  type="radio" name="subject" value={s} checked={values.subject === s}
                  onChange={() => setValues((v) => ({ ...v, subject: s }))}
                  className="sr-only"
                />
                {t(s)}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <Field
        n={4} id="contact-message" label={t('Message')} error={errors.message}
        hint={<span className={cn('nums', count >= MIN ? 'text-ink' : 'text-mute')}>{characters(count, ar)}</span>}
      >
        <textarea
          id="contact-message" rows={5} value={values.message} onChange={set('message')}
          placeholder={t('An order number, a piece, a size — whatever helps us answer.')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'}
          className={cn(INPUT, 'resize-y leading-[1.5]')}
        />
      </Field>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn btn-solid group w-full sm:w-auto">
          {t('Send message')} <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </button>
        <p className="max-w-[38ch] text-xs leading-relaxed text-mute sm:text-end">
          {ar ? (
            <>
              النموذج يفتح تطبيق الإيميل عندك والرسالة جاهزة توصل لميرت. شوف{' '}
              <Link href="/privacy" className="link-rule text-ink">سياسة الخصوصية</Link>.
            </>
          ) : (
            <>
              This form opens your email app with the message ready to send to MERIT. See the{' '}
              <Link href="/privacy" className="link-rule text-ink">privacy policy</Link>.
            </>
          )}
        </p>
      </div>
    </form>
  );
}

const INPUT =
  'w-full min-h-12 border-0 bg-transparent py-2 text-[clamp(1.125rem,1rem+0.5vw,1.5rem)] font-medium tracking-[-0.02em] ' +
  'placeholder:text-hint focus-visible:outline-none!';

function Field({
  n, id, label, error, hint, children,
}: {
  n: number;
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative grid gap-x-(--gutter) gap-y-1 border-b py-5 transition-colors duration-300 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:py-6',
        error ? 'border-oxide' : 'border-line focus-within:border-ink',
      )}
    >
      <label htmlFor={id} className="label-sm flex items-baseline gap-3 pt-1 text-mute transition-colors group-focus-within:text-ink sm:pt-4">
        <span className="nums">{String(n).padStart(2, '0')}</span>
        {label}
      </label>
      <div className="min-w-0">
        {children}
        {error ? (
          <p id={`${id}-error`} role="alert" className="mt-2 flex items-center gap-2 text-sm text-oxide">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="label-sm mt-2 text-mute">{hint}</p>
        ) : null}
      </div>
      {/* The rule under the line thickens to ink while you type in it. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-ink rtl:origin-right transition-transform duration-500 ease-(--ease-out) group-focus-within:scale-x-100',
          error && 'bg-oxide',
        )}
      />
    </div>
  );
}
