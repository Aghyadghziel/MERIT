import type { Category, Gender, Product } from '@/lib/catalog';
import { collections, products, stories } from '@/lib/catalog';
import { pad2 } from '@/lib/format';
import type { Locale } from '@/i18n/config';
import { makeT, type T } from '@/i18n/dictionary';
import { localizeProduct } from '@/i18n/products';

export const CATEGORY_ORDER: Category[] = [
  'Outerwear', 'Tailoring', 'Knitwear', 'Shirting', 'Trousers', 'Dresses', 'Footwear', 'Accessories',
];

const poolFor = (gender: Gender) => products.filter((p) => p.gender === gender || p.gender === 'unisex');

/** Only offer a category in a menu if something in it exists for that gender. */
function categoriesFor(gender: Gender) {
  const pool = poolFor(gender);
  return CATEGORY_ORDER.filter((c) => pool.some((p) => p.category === c));
}

const countFor = (gender: Gender, category: Category) =>
  poolFor(gender).filter((p) => p.category === category).length;

/**
 * The picture each menu entry shows while it is hovered. Chosen by hand from
 * the photographs already in the catalogue — the first product image is not
 * always the one that explains a category — with the first product image as
 * the fallback for anything added later.
 */
const CATEGORY_IMAGE: Record<'women' | 'men', Partial<Record<Category, string>>> = {
  women: {
    Outerwear: 'coat-meridian-1',
    Tailoring: 'blazer-rule-1',
    Knitwear: 'knit-margin-1',
    Shirting: 'shirt-quiet-2',
    Trousers: 'trouser-column-1',
    Dresses: 'dress-plane-1',
    Footwear: 'shoe-pivot-1',
    Accessories: 'bag-axis-1',
  },
  men: {
    Outerwear: 'coat-overcoat-2',
    Tailoring: 'jacket-rule-m-1',
    Knitwear: 'knit-merino-m-1',
    Shirting: 'shirt-oxford-m-1',
    Trousers: 'trouser-pleat-m-1',
    Footwear: 'shoe-derby-1',
    Accessories: 'bag-knot-1',
  },
};

function imageFor(gender: 'women' | 'men', category: Category) {
  return (
    CATEGORY_IMAGE[gender][category] ??
    poolFor(gender).find((p) => p.category === category && !p.images[0].includes('/'))?.images[0] ??
    'cat-essentials'
  );
}

/**
 * One entry in a menu. `image` is what the preview well shows on hover;
 * `meta` is a short fact set beside the label (a count, a season); `note` is
 * a line of real copy set under it, used by the story list.
 */
export type MenuLink = { label: string; href: string; image?: string; meta?: string; note?: string };

export type MenuColumn = { title: string; links: MenuLink[] };

export type MenuFeature = {
  image: string;
  kicker: string;
  title: string;
  href: string;
  cta: string;
};

export type Menu = {
  /** The list set at poster size. `size` drops it a step for long titles. */
  primary: MenuColumn & { size?: 'lg' | 'md' };
  /** Quieter supporting lists. */
  columns: MenuColumn[];
  feature: MenuFeature;
  viewAll: { label: string; href: string };
  /** A plain fact for the foot of the menu, counted from the catalogue. */
  note: string;
};

/** `key` is the English label: stable across languages, used for ids. */
export type NavItem = { key: string; label: string; href: string; menu?: Menu };

/**
 * A count of things in the reader's language. Arabic counts agree with the
 * noun: one and two have their own words, 3–10 take the plural, 11 and up
 * the singular.
 */
export function countOf(
  n: number,
  locale: Locale,
  en: [one: string, many: string],
  ar: [one: string, two: string, few: string, many: string],
  num: (n: number) => string = String,
) {
  if (locale !== 'ar') return `${num(n)} ${n === 1 ? en[0] : en[1]}`;
  if (n === 1) return ar[0];
  if (n === 2) return ar[1];
  const r = n % 100;
  return `${num(n)} ${r >= 3 && r <= 10 ? ar[2] : ar[3]}`;
}

/** AW 26, SS 26, Show 26, Permanent: never the collection's own name again. */
const seasonShort = (season: string, year: number, t: T) => {
  const yy = String(year).slice(2);
  if (season === 'Permanent') return t(season);
  if (season === 'Runway') return t('Show {yy}', { yy });
  return t(`${season.split(' ').map((w) => w[0]).join('')} {yy}`, { yy });
};

const collectionLinks = (t: T): MenuLink[] =>
  collections.map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
    image: c.image,
    meta: seasonShort(c.season, c.year, t),
  }));

/**
 * The accessories, by name. The catalogue has no bag, scarf or jewellery
 * filter, so the menu does not pretend to: each piece links to itself.
 */
const accessoryLinks = (gender: Gender, locale: Locale): MenuLink[] =>
  poolFor(gender)
    .filter((p) => p.category === 'Accessories')
    .map((p: Product) => ({ label: localizeProduct(p, locale).name, href: `/products/${p.slug}`, image: p.images[0] }));

const shopMenu = (gender: 'women' | 'men', base: string, t: T, locale: Locale): Menu => {
  const women = gender === 'women';
  const pieces = poolFor(gender).length;
  return {
    primary: {
      // Every category that exists for this gender, shoes and accessories
      // included, each one a real filter with a real count.
      title: t('Shop by category'),
      links: categoriesFor(gender).map((c) => ({
        label: t(c),
        href: `${base}?category=${encodeURIComponent(c)}`,
        image: imageFor(gender, c),
        meta: pad2(countFor(gender, c)),
      })),
    },
    columns: [
      { title: t('Accessories, by piece'), links: accessoryLinks(gender, locale) },
      { title: t('Collections'), links: collectionLinks(t) },
    ],
    feature: {
      image: women ? 'campaign-rule-line' : 'campaign-foundation',
      kicker: t(women ? 'Campaign · Autumn Winter 26' : 'Collection · Autumn Winter 26'),
      title: women ? t('The Rule Line') : 'Foundation',
      href: women ? '/editorial/the-rule-line' : '/collections/foundation',
      cta: t(women ? 'Read the story' : 'View collection'),
    },
    viewAll: { label: t(women ? "View all women's" : "View all men's"), href: base },
    note: t(women ? '{n} pieces, women and unisex' : '{n} pieces, men and unisex', {
      n: countOf(pieces, locale, ['', ''], ['قطعة واحدة', 'قطعتان', 'قطع', 'قطعة']).trim(),
    }),
  };
};

/** The permanent range, by what is actually in it. */
const indexCategories = CATEGORY_ORDER.filter((c) =>
  products.some((p) => p.collection === 'index' && p.category === c),
);

const INDEX_IMAGE: Partial<Record<Category, string>> = {
  Trousers: 'trouser-column-2',
  Shirting: 'shirt-quiet-3',
  Knitwear: 'knit-baseline-1',
  Accessories: 'bag-axis-2',
};

function buildNav(locale: Locale): NavItem[] {
  const t = makeT(locale);
  return [
    { key: 'New', label: t('New'), href: '/new' },
    { key: 'Women', label: t('Women'), href: '/women', menu: shopMenu('women', '/women', t, locale) },
    { key: 'Men', label: t('Men'), href: '/men', menu: shopMenu('men', '/men', t, locale) },
    {
      key: 'Collections',
      label: t('Collections'),
      href: '/collections',
      menu: {
        primary: { title: t('The collections'), links: collectionLinks(t) },
        columns: [
          {
            title: t('Index, by category'),
            links: indexCategories.map((c) => ({
              label: t(c),
              href: `/collections/index?category=${encodeURIComponent(c)}`,
              image: INDEX_IMAGE[c],
            })),
          },
          {
            // The stories written about a collection, so the list above has
            // somewhere to go deeper without repeating itself.
            title: t('The stories behind them'),
            links: stories
              .filter((s) => s.kicker !== 'Atelier')
              .map((s) => ({ label: t(s.title), href: `/editorial/${s.slug}`, image: s.cover })),
          },
        ],
        feature: {
          image: 'campaign-atrium',
          kicker: t('Collection · Spring Summer 26'),
          title: 'Atrium',
          href: '/collections/atrium',
          cta: t('View collection'),
        },
        viewAll: { label: t('View all collections'), href: '/collections' },
        note: t('{n} collections, one of them permanent', { n: collections.length }),
      },
    },
    {
      key: 'Editorial',
      label: t('Editorial'),
      href: '/editorial',
      menu: {
        primary: {
          title: t('Stories'),
          size: 'md',
          links: stories.map((s) => ({
            label: t(s.title),
            href: `/editorial/${s.slug}`,
            image: s.cover,
            meta: t(s.kicker),
            note: t(s.standfirst),
          })),
        },
        columns: [
          {
            title: t('The house'),
            links: [
              { label: t('About MERIT'), href: '/about', image: 'manifesto-rail' },
              { label: t('Stores'), href: '/stores', image: 'campaign-studio' },
              { label: t('Contact'), href: '/contact', image: 'statement-detail' },
            ],
          },
        ],
        feature: {
          image: 'atelier-basting',
          kicker: t('Atelier'),
          title: t('On Making: The Basted Jacket'),
          href: '/editorial/on-making-the-basted-jacket',
          cta: t('Read'),
        },
        viewAll: { label: t('View all stories'), href: '/editorial' },
        note: t('{n} stories', { n: stories.length }),
      },
    },
    { key: 'About', label: t('About'), href: '/about' },
  ];
}

/** The navigation, in English. */
export const NAV: NavItem[] = buildNav('en');
const NAV_AR = buildNav('ar');

/** The navigation in the reader's language. Hrefs never change. */
export const navFor = (locale: Locale): NavItem[] => (locale === 'ar' ? NAV_AR : NAV);

export const FOOTER = [
  {
    title: 'Customer care',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Shipping and returns', href: '/shipping-returns' },
      { label: 'Size guide', href: '/size-guide' },
      { label: 'Frequently asked', href: '/faq' },
      { label: 'Care and repair', href: '/faq#care' },
    ],
  },
  {
    title: 'The house',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Stores', href: '/stores' },
      { label: 'Editorial', href: '/editorial' },
      { label: 'Collections', href: '/collections' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/account' },
      { label: 'Orders', href: '/account' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Shopping bag', href: '/cart' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of sale', href: '/terms' },
      { label: 'Cookies', href: '/privacy#cookies' },
    ],
  },
];
