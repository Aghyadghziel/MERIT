'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const SUBJECTS = ['An order', 'Sizing and fit', 'Alterations', 'An appointment', 'Press', 'Something else'];

/**
 * Validated properly, then told the truth: there is no inbox behind this form,
 * so it hands over an email address instead of pretending to send.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Tell us who you are.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = 'We need a working email address to reply to.';
    if (values.message.trim().length < 10) next.message = 'A sentence or two, so we can answer properly.';
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <div className="rule-t pt-8" role="status">
        <p className="display-md">Thank you, {values.name.split(' ')[0]}.</p>
        <p className="mt-4 max-w-md text-sm text-mute">
          This is a concept site, so the message was not sent anywhere and no address was stored.
          On a real MERIT you would have an answer within a working day.
        </p>
        <button type="button" className="btn btn-ghost mt-8" onClick={() => { setSent(false); setValues({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}>
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-xl">
      <Field id="name" label="Name" error={errors.name}>
        <input id="name" value={values.name} onChange={set('name')} autoComplete="name"
          aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} className="field" />
      </Field>

      <Field id="email" label="Email" error={errors.email}>
        <input id="email" type="email" inputMode="email" value={values.email} onChange={set('email')} autoComplete="email"
          aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} className="field" />
      </Field>

      <Field id="subject" label="About">
        <select id="subject" value={values.subject} onChange={set('subject')} className="field cursor-pointer">
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>

      <Field id="message" label="Message" error={errors.message}>
        <textarea id="message" rows={5} value={values.message} onChange={set('message')}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined}
          className="field resize-y" />
      </Field>

      <button type="submit" className="btn btn-solid mt-8">Send</button>
      <p className="mt-4 text-xs text-mute">
        We keep what you write only as long as it takes to answer it. See the privacy policy.
      </p>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <label htmlFor={id} className="label-sm text-mute">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 flex items-center gap-2 text-sm text-oxide">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
