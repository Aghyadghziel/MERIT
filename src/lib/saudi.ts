/**
 * The details a Saudi reader looks for on the Arabic site: the Hijri date
 * beside the Gregorian one, the payment methods people here actually use, and
 * WhatsApp as a way to reach the house. MERIT is a concept, so every one of
 * them is shown for what it is — nothing is connected, and the number is the
 * same placeholder the rest of the site prints.
 */

/** Today in the Umm al-Qura calendar, in Riyadh, with Western digits: "٢ ربيع الآخر ١٤٤٨ هـ" → "2 ربيع الآخر 1448 هـ". */
export const hijriDate = (date = new Date()) =>
  new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh',
  }).format(date);

/**
 * How a Saudi store is paid for, in the order a customer looks for them.
 * Names only, as text: no scheme logos, and never a working button.
 */
export const PAYMENT_METHODS = ['مدى', 'Apple Pay', 'STC Pay', 'تابي', 'تمارا'] as const;
