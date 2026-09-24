import { Alyamama, Badeen_Display, IBM_Plex_Sans_Arabic, Inter_Tight, Markazi_Text } from 'next/font/google';

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
 * Arabic poster type: Badeen Display, an ultra-black display face that sits
 * the whole word on one flat line — the Arabic answer to the heavy, poured
 * MERIT logotype. It has one weight and is for large sizes only: headlines,
 * collection names, the campaign, the category index.
 */
const arabicDisplay = Badeen_Display({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-arabic-display',
  display: 'swap',
});

/**
 * Arabic headings below poster size: Alyamama, a sharp modern Arabic named
 * for the Yamama, the region around Riyadh. Set heavy, it carries the smaller
 * headlines where Badeen's black would close up.
 */
const arabicHead = Alyamama({
  subsets: ['arabic'],
  weight: ['500', '700', '800', '900'],
  variable: '--font-arabic-head',
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

export const fontVariables = `${grotesk.variable} ${arabic.variable} ${arabicDisplay.variable} ${arabicHead.variable} ${arabicEditorial.variable}`;

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
export const arabicHeadStack = `${face(grotesk)}, ${face(arabicHead)}, ${face(arabic)}, ${grotesk.style.fontFamily}, ${arabicHead.style.fontFamily}`;
export const arabicEditorialStack = `${face(grotesk)}, ${face(arabicEditorial)}, ${face(arabic)}, ${grotesk.style.fontFamily}, ${arabicEditorial.style.fontFamily}`;
