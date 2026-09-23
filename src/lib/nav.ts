import type { Category, Gender } from '@/lib/catalog';
import { collections, products, stories } from '@/lib/catalog';
import { pad2 } from '@/lib/format';

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

export type NavItem = { label: string; href: string; menu?: Menu };

/** AW 26, SS 26, Show 26, Permanent: never the collection's own name again. */
const seasonShort = (season: string, year: number) =>
  season === 'Permanent'
    ? season
    : season === 'Runway'
      ? `Show ${String(year).slice(2)}`
      : `${season.split(' ').map((w) => w[0]).join('')} ${String(year).slice(2)}`;

const collectionLinks = (): MenuLink[] =>
  collections.map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
    image: c.image,
    meta: seasonShort(c.season, c.year),
  }));

/**
 * The accessories, by name. The catalogue has no bag, scarf or jewellery
 * filter, so the menu does not pretend to: each piece links to itself.
 */
const accessoryLinks = (gender: Gender): MenuLink[] =>
  poolFor(gender)
    .filter((p) => p.category === 'Accessories')
    .map((p) => ({ label: p.name, href: `/products/${p.slug}`, image: p.images[0] }));

const shopMenu = (gender: 'women' | 'men', base: string): Menu => {
  const women = gender === 'women';
  const pieces = poolFor(gender).length;
  return {
    primary: {
      // Every category that exists for this gender, shoes and accessories
      // included, each one a real filter with a real count.
      title: 'Shop by category',
      links: categoriesFor(gender).map((c) => ({
        label: c,
        href: `${base}?category=${encodeURIComponent(c)}`,
        image: imageFor(gender, c),
        meta: pad2(countFor(gender, c)),
      })),
    },
    columns: [
      { title: 'Accessories, by piece', links: accessoryLinks(gender) },
      { title: 'Collections', links: collectionLinks() },
    ],
    feature: {
      image: women ? 'campaign-rule-line' : 'campaign-foundation',
      kicker: women ? 'Campaign · Autumn Winter 26' : 'Collection · Autumn Winter 26',
      title: women ? 'The Rule Line' : 'Foundation',
      href: women ? '/editorial/the-rule-line' : '/collections/foundation',
      cta: women ? 'Read the story' : 'View collection',
    },
    viewAll: { label: women ? "View all women's" : "View all men's", href: base },
    note: `${pieces} pieces, ${women ? 'women' : 'men'} and unisex`,
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

export const NAV: NavItem[] = [
  { label: 'New', href: '/new' },
  { label: 'Women', href: '/women', menu: shopMenu('women', '/women') },
  { label: 'Men', href: '/men', menu: shopMenu('men', '/men') },
  {
    label: 'Collections',
    href: '/collections',
    menu: {
      primary: { title: 'The collections', links: collectionLinks() },
      columns: [
        {
          title: 'Index, by category',
          links: indexCategories.map((c) => ({
            label: c,
            href: `/collections/index?category=${encodeURIComponent(c)}`,
            image: INDEX_IMAGE[c],
          })),
        },
        {
          // The stories written about a collection, so the list above has
          // somewhere to go deeper without repeating itself.
          title: 'The stories behind them',
          links: stories
            .filter((s) => s.kicker !== 'Atelier')
            .map((s) => ({ label: s.title, href: `/editorial/${s.slug}`, image: s.cover })),
        },
      ],
      feature: {
        image: 'campaign-atrium',
        kicker: 'Collection · Spring Summer 26',
        title: 'Atrium',
        href: '/collections/atrium',
        cta: 'View collection',
      },
      viewAll: { label: 'View all collections', href: '/collections' },
      note: `${collections.length} collections, one of them permanent`,
    },
  },
  {
    label: 'Editorial',
    href: '/editorial',
    menu: {
      primary: {
        title: 'Stories',
        size: 'md',
        links: stories.map((s) => ({
          label: s.title,
          href: `/editorial/${s.slug}`,
          image: s.cover,
          meta: s.kicker,
          note: s.standfirst,
        })),
      },
      columns: [
        {
          title: 'The house',
          links: [
            { label: 'About MERIT', href: '/about', image: 'manifesto-rail' },
            { label: 'Stores', href: '/stores', image: 'campaign-studio' },
            { label: 'Contact', href: '/contact', image: 'statement-detail' },
          ],
        },
      ],
      feature: {
        image: 'atelier-basting',
        kicker: 'Atelier',
        title: 'On Making: The Basted Jacket',
        href: '/editorial/on-making-the-basted-jacket',
        cta: 'Read',
      },
      viewAll: { label: 'View all stories', href: '/editorial' },
      note: `${stories.length} stories`,
    },
  },
  { label: 'About', href: '/about' },
];

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
