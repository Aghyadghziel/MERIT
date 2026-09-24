import { IBM_Plex_Sans_Arabic, Inter_Tight } from 'next/font/google';

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

export const fontVariables = `${grotesk.variable} ${arabic.variable}`;

/**
 * The type stack for Arabic pages. Each next/font family ends in an adjusted
 * local Arial with no unicode-range, and Plex ships Latin glyphs too, so
 * neither variable can simply go first. Inter Tight's own face comes first:
 * it has no Arabic, so Latin runs ("Axis", "Foundation") stay in the grotesk
 * and Arabic falls through to Plex before any Arial.
 */
const face = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(',')[0].trim();
export const arabicStack = `${face(grotesk)}, ${face(arabic)}, ${grotesk.style.fontFamily}, ${arabic.style.fontFamily}`;
