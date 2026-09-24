'use client';

import { useStore } from '@/components/providers/Store';
import { Icon } from '@/components/ui/Icon';
import { useT } from '@/i18n/client';
import { CURRENCIES, currencyCodes } from '@/lib/format';

/**
 * Changing this re-prices every figure on the site, live. A real <select>
 * underneath — the phone's own picker, the keyboard, the screen reader — with
 * the OS chrome taken off and the house chevron drawn in the current colour.
 */
export function CurrencySelect({ id = 'currency' }: { id?: string }) {
  const { currency, setCurrency, ready } = useStore();
  const t = useT();
  return (
    <label className="relative flex items-center" htmlFor={id}>
      <span className="sr-only">{t('Currency')}</span>
      <select
        id={id}
        className="label select-quiet"
        value={ready ? currency : 'SAR'}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
      >
        {currencyCodes.map((code) => (
          <option key={code} value={code}>
            {code} — {t(CURRENCIES[code].name)}
          </option>
        ))}
      </select>
      <Icon name="chevD" className="pointer-events-none absolute end-0 h-3.5 w-3.5" />
    </label>
  );
}
