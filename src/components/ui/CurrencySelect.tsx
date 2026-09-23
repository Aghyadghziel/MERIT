'use client';

import { useStore } from '@/components/providers/Store';
import { CURRENCIES, currencyCodes } from '@/lib/format';

/** Changing this re-prices every figure on the site, live. */
export function CurrencySelect({ id = 'currency' }: { id?: string }) {
  const { currency, setCurrency, ready } = useStore();
  return (
    <label className="flex items-center gap-2" htmlFor={id}>
      <span className="sr-only">Currency</span>
      <select
        id={id}
        className="label bg-transparent py-1 [&>option]:text-ink"
        value={ready ? currency : 'SAR'}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
      >
        {currencyCodes.map((code) => (
          <option key={code} value={code}>
            {code} — {CURRENCIES[code].name}
          </option>
        ))}
      </select>
    </label>
  );
}
