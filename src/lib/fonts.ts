import { Archivo, Newsreader } from 'next/font/google';

/**
 * Two voices. Newsreader is the editorial one — a text serif with enough
 * personality to carry an oversized headline without tipping into luxury
 * pastiche. Archivo is the interface: prices, sizes, filters, buttons.
 *
 * Both are loaded as variable fonts with `swap`, and the fallback metrics are
 * adjusted by next/font so the swap does not shift the layout.
 */
const display = Newsreader({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const sans = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});

export const fontVariables = `${display.variable} ${sans.variable}`;
