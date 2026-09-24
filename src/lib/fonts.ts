import { IBM_Plex_Sans_Arabic, Inter_Tight, Kufam, Markazi_Text } from 'next/font/google';

/**
 * The brand face is Neue Haas Grotesk (Monotype). It needs a web licence, so
 * until the licensed WOFF2 files are added this loads Inter Tight: a grotesk
 * of the same family tree, tight-set, with a true 800 for display sizes.
 *
 * To switch: put NeueHaasGrotesk*.woff2 in src/app/fonts/, replace this with
 * next/font/local, and keep the variable name `--font-grotesk`.
 */
const grotesk = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-grotesk',
  display: 'swap',
});

/** Arabic: a modern grotesk-style naskh-kufi hybrid that sits with the Latin. */
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

/**
 * Arabic display: Kufam, a heavy compact kufi. It sets the Arabic headlines
 * and poster words the way Inter Tight 800 sets the Latin ones — dense, dark,
 * built on a flat baseline — instead of the body face blown up.
 */
const arabicDisplay = Kufam({
  subsets: ['arabic'],
  weight: ['600', '700', '800'],
  variable: '--font-arabic-display',
  display: 'swap',
});

/**
 * Arabic editorial: Markazi Text, a modern naskh for the quotes and the
 * story text. Arabic has no italic; a second, written hand is how the house
 * voice changes register.
 */
const arabicEditorial = Markazi_Text({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-arabic-editorial',
  display: 'swap',
});

export const fontVariables = `${grotesk.variable} ${arabic.variable} ${arabicDisplay.variable} ${arabicEditorial.variable}`;

/**
 * The type stack for Arabic pages. Each next/font family ends in an adjusted
 * local Arial with no unicode-range, and Plex ships Latin glyphs too, so
 * neither variable can simply go first. Inter Tight's own face comes first:
 * it has no Arabic, so Latin runs ("Axis", "Foundation") stay in the grotesk
 * and Arabic falls through to Plex before any Arial.
 */
const face = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(',')[0].trim();
export const arabicStack = `${face(grotesk)}, ${face(arabic)}, ${grotesk.style.fontFamily}, ${arabic.style.fontFamily}`;
export const arabicDisplayStack = `${face(grotesk)}, ${face(arabicDisplay)}, ${face(arabic)}, ${grotesk.style.fontFamily}, ${arabicDisplay.style.fontFamily}`;
export const arabicEditorialStack = `${face(grotesk)}, ${face(arabicEditorial)}, ${face(arabic)}, ${grotesk.style.fontFamily}, ${arabicEditorial.style.fontFamily}`;
