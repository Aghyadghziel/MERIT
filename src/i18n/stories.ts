import type { Collection, Story } from '@/lib/catalog';
import { pullQuote } from '@/components/editorial/data';
import type { Locale } from './config';
import { translate } from './dictionary';
import { COUNTS_AR, STORIES_AR } from './ar/stories';

/**
 * A story in the reader's language. The title and standfirst come from the
 * dictionary (keyed by the English), the text part by part from STORIES_AR.
 * Slug, kicker, season, pictures and the pieces it shops stay as they are —
 * kicker and season are printed through t() at the point of use, so helpers
 * that compare them (seasonOf) keep working on the English.
 */
export function localizeStory<S extends Story>(s: S, locale: Locale): S {
  if (locale !== 'ar') return s;
  const ar = STORIES_AR[s.slug];
  return {
    ...s,
    title: keepLatin(translate(locale, s.title)),
    standfirst: translate(locale, s.standfirst),
    body: ar?.body.length === s.body.length ? ar.body : s.body,
  };
}

/**
 * Holds a run of Latin words together ("Rule Line", "Runway 01") with
 * no-break spaces. Headlines are set word by word, each word its own inline
 * block for the reveal, and in a right-to-left line separate blocks are laid
 * right to left — "Rule Line" would read "Line Rule". Kept as one word, the
 * run keeps its own order. Arabic pages only: in English it would stop a
 * whole headline from wrapping.
 */
export const keepLatin = (text: string) => text.replace(/([A-Za-z0-9][^\s\u0600-\u06FF]*) (?=[A-Za-z0-9])/g, '$1\u00A0');

/** A collection in the reader's language: its statement and note. The name stays in Latin. */
export function localizeCollection<C extends Collection>(c: C, locale: Locale): C {
  if (locale !== 'ar') return c;
  return { ...c, statement: translate(locale, c.statement), note: translate(locale, c.note) };
}

/**
 * The pull quote for a story, in the reader's language. The Arabic line is
 * held to the same rule as the English: used only if it appears word for word
 * in the Arabic text, otherwise a whole sentence of that text stands in.
 */
export function storyQuote(story: Story, locale: Locale): string | null {
  if (locale !== 'ar') return pullQuote(story);
  const ar = STORIES_AR[story.slug];
  if (!ar) return pullQuote(story);
  return pullQuote({ ...story, body: ar.body }, ar.quote ?? null);
}

const EN: Record<string, [one: string, many: string]> = {
  piece: ['piece', 'pieces'],
  frame: ['frame', 'frames'],
  story: ['story', 'stories'],
  collection: ['collection', 'collections'],
  minute: ['minute', 'minutes'],
  min: ['min', 'min'],
  part: ['part', 'parts'],
};

/**
 * "4 pieces" / "04 stories" in either language. `shown` is the number as the
 * page prints it (zero-padded or not); the form is chosen from `n`.
 */
export function count(locale: Locale, n: number, noun: keyof typeof COUNTS_AR & string, shown: string | number = n): string {
  if (locale === 'ar') {
    const f = COUNTS_AR[noun];
    const m = n % 100;
    const form = n === 1 ? f.one : n === 2 ? f.two : m >= 3 && m <= 10 ? f.few : n === 0 ? f.few : f.many;
    return form.replace('{n}', String(shown));
  }
  const [one, many] = EN[noun] ?? [noun, `${noun}s`];
  return `${shown} ${n === 1 ? one : many}`;
}
