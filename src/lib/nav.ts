import type { Category, Gender } from '@/lib/catalog';
import { collections, products, stories } from '@/lib/catalog';

export const CATEGORY_ORDER: Category[] = [
  'Outerwear', 'Tailoring', 'Knitwear', 'Shirting', 'Trousers', 'Dresses', 'Footwear', 'Accessories',
];

/** Only offer a category in a menu if something in it exists for that gender. */
function categoriesFor(gender: Gender) {
  const pool = products.filter((p) => p.gender === gender || p.gender === 'unisex');
  return CATEGORY_ORDER.filter((c) => pool.some((p) => p.category === c));
}

export type MenuColumn = { title: string; links: { label: string; href: string }[] };

export type MenuFeature = {
  image: string;
  kicker: string;
  title: string;
  href: string;
  cta: string;
};

export type NavItem = {
  label: string;
  href: string;
  menu?: { columns: MenuColumn[]; feature: MenuFeature; viewAll: { label: string; href: string } };
};

const shopMenu = (gender: Gender, base: string) => ({
  columns: [
    {
      title: 'Ready to wear',
      links: categoriesFor(gender)
        .filter((c) => c !== 'Accessories' && c !== 'Footwear')
        .map((c) => ({ label: c, href: `${base}?category=${encodeURIComponent(c)}` })),
    },
    {
      title: 'Accessories',
      links: [
        { label: 'Bags', href: `${base}?category=Accessories` },
        { label: 'Footwear', href: `${base}?category=Footwear` },
        { label: 'Jewellery', href: `${base}?category=Accessories&colour=Brass` },
        { label: 'Scarves', href: `${base}?category=Accessories&collection=foundation` },
      ],
    },
    {
      title: 'Collections',
      links: collections.map((c) => ({ label: c.name, href: `/collections/${c.slug}` })),
    },
  ],
  feature: {
    image: gender === 'women' ? 'campaign-rule-line' : 'campaign-foundation',
    kicker: gender === 'women' ? 'Campaign · Autumn Winter 26' : 'Collection · Autumn Winter 26',
    title: gender === 'women' ? 'The Rule Line' : 'Foundation',
    href: gender === 'women' ? '/editorial/the-rule-line' : '/collections/foundation',
    cta: 'View story',
  },
  viewAll: { label: gender === 'women' ? "View all women's" : "View all men's", href: base },
});

export const NAV: NavItem[] = [
  { label: 'New', href: '/new' },
  { label: 'Women', href: '/women', menu: shopMenu('women', '/women') },
  { label: 'Men', href: '/men', menu: shopMenu('men', '/men') },
  {
    label: 'Collections',
    href: '/collections',
    menu: {
      columns: [
        {
          title: 'Seasons',
          links: collections
            .filter((c) => c.season !== 'Permanent')
            .map((c) => ({ label: `${c.name} · ${c.season} ${String(c.year).slice(2)}`, href: `/collections/${c.slug}` })),
        },
        {
          title: 'Permanent',
          links: [
            { label: 'Index', href: '/collections/index' },
            { label: 'Tailoring', href: '/collections/index?category=Tailoring' },
            { label: 'Shirting', href: '/collections/index?category=Shirting' },
          ],
        },
        {
          title: 'Archive',
          links: [
            { label: 'Runway 01', href: '/collections/runway-01' },
            { label: 'All collections', href: '/collections' },
          ],
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
    },
  },
  {
    label: 'Editorial',
    href: '/editorial',
    menu: {
      columns: [
        {
          title: 'Latest',
          links: stories.slice(0, 2).map((s) => ({ label: s.title, href: `/editorial/${s.slug}` })),
        },
        {
          title: 'Archive',
          links: stories.slice(2).map((s) => ({ label: s.title, href: `/editorial/${s.slug}` })),
        },
        {
          title: 'The house',
          links: [
            { label: 'About MERIT', href: '/about' },
            { label: 'Stores', href: '/stores' },
            { label: 'Contact', href: '/contact' },
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
