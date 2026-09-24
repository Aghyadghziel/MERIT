/**
 * MERIT icon set — drawn on a 20-unit grid with a 1.3 stroke and butt caps, so
 * every glyph shares the weight of the rule. No filled shapes except the
 * wishlist heart, which needs a filled state to read as "saved".
 */
const P = {
  search: 'M9 3a6 6 0 1 0 0 12A6 6 0 0 0 9 3ZM13.3 13.3 17.5 17.5',
  bag: 'M4 6h12l1 11H3L4 6ZM7.2 6V4.6a2.8 2.8 0 0 1 5.6 0V6',
  heart: 'M10 16.2 4.3 10.6a3.4 3.4 0 0 1 4.8-4.8l.9.9.9-.9a3.4 3.4 0 0 1 4.8 4.8L10 16.2Z',
  account: 'M10 3.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3.8 16.8a6.2 6.2 0 0 1 12.4 0',
  close: 'M4.5 4.5 15.5 15.5M15.5 4.5 4.5 15.5',
  plus: 'M10 4v12M4 10h12',
  minus: 'M4 10h12',
  arrowR: 'M3.5 10h13M11.6 5 16.6 10l-5 5',
  arrowL: 'M16.5 10h-13M8.4 5 3.4 10l5 5',
  arrowUp: 'M10 16.5v-13M5 8.4 10 3.4l5 5',
  diagonal: 'M6 14 14 6M7.4 6H14v6.6',
  chevD: 'M4.5 7.5 10 13l5.5-5.5',
  chevU: 'M4.5 12.5 10 7l5.5 5.5',
  chevL: 'M12.5 4.5 7 10l5.5 5.5',
  chevR: 'M7.5 4.5 13 10l-5.5 5.5',
  check: 'M4 10.4 8 14.4 16 5.6',
  alert: 'M10 3.5v8M10 15.2v1.3',
  globe: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM3.2 10h13.6M10 3a11 11 0 0 1 0 14 11 11 0 0 1 0-14Z',
  filter: 'M3 5.5h14M5.5 10h9M8.5 14.5h3',
  trash: 'M4.5 5.5h11M8 5.5V3.6h4v1.9M6 5.5l.8 11h6.4l.8-11M8.6 8.4v5.2M11.4 8.4v5.2',
  play: 'M7 4.6 15 10l-8 5.4V4.6Z',
  menu: 'M3 6h14M3 14h14',
  grid2: 'M3 3h6v14H3zM11 3h6v14h-6z',
  grid4: 'M3 3h3v14H3zM7.3 3h3v14h-3zM11.7 3h3v14h-3zM16 3h1v14h-1z',
  pin: 'M10 17.5s5.2-5.4 5.2-9a5.2 5.2 0 1 0-10.4 0c0 3.6 5.2 9 5.2 9ZM10 6.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z',
  mail: 'M2.5 5h15v10h-15zM2.5 5.4 10 11l7.5-5.6',
  ruler: 'M2.5 7.5h15v5h-15zM6 7.5v2.4M9 7.5v3.4M12 7.5v2.4M15 7.5v3.4',
  truck: 'M1.5 5h10v9h-10zM11.5 8h3.4l2.6 3v3h-6zM5 14a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 5 14ZM14 14a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 14 14Z',
  leaf: 'M4 16C4 8.5 9 4.5 16.5 4 17 11.5 12.5 16.5 5.5 16.5M4.5 16 10 10.5',
  /** The return key, for "press enter to see everything" hints. */
  enter: 'M16 4.5v6H4.5M8 7 4.5 10.5 8 14',
} as const;

export type IconName = keyof typeof P;

type Props = {
  name: IconName;
  className?: string;
  /** Solid fill — only the wishlist heart uses it, to show a saved state. */
  filled?: boolean;
};

export function Icon({ name, className = 'w-[18px] h-[18px]', filled }: Props) {
  return (
    <svg
      data-icon={name}
      viewBox="0 0 20 20"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d={P[name]} />
      {name === 'alert' ? <circle cx="10" cy="10" r="7.4" /> : null}
    </svg>
  );
}
