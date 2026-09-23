import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/SectionHead';

const FEATURED = [
  {
    title: 'Tailoring',
    note: 'Half-canvassed jackets and the trousers drawn to go under them.',
    href: '/women?category=Tailoring',
    image: 'cat-tailoring',
    ratio: 'frame-3-4' as const,
    span: 'col-span-4 md:col-span-6 lg:col-span-7',
    size: '(min-width:1024px) 56vw, 100vw',
  },
  {
    title: 'Essentials',
    note: 'The Index pieces — cut from the same patterns every year.',
    href: '/collections/index',
    image: 'cat-essentials',
    ratio: 'frame-4-5' as const,
    span: 'col-span-4 md:col-span-3 lg:col-span-5',
    size: '(min-width:1024px) 40vw, 50vw',
  },
  {
    title: 'Accessories',
    note: 'Leather, brass and silk, made in counts of under two hundred.',
    href: '/women?category=Accessories',
    image: 'cat-accessories',
    ratio: 'frame-3-2' as const,
    span: 'col-span-4 md:col-span-3 lg:col-span-5 lg:col-start-8',
    size: '(min-width:1024px) 40vw, 50vw',
  },
];

/** Three categories at three different scales, deliberately unbalanced. */
export function FeaturedCategories({ index }: { index: number }) {
  return (
    <section className="page section-y" aria-labelledby="categories-title">
      <SectionHead index={index} title="Where to start" as="h2" className="[&_h2]:sr-only" />
      <h2 id="categories-title" className="sr-only">Featured categories</h2>

      <div className="grid-page mt-12 md:mt-16">
        {FEATURED.map((f) => (
          <Link key={f.title} href={f.href} className={`group block ${f.span}`}>
            <div className={`frame ${f.ratio}`} data-reveal-img>
              <Image
                src={`/img/${f.image}.webp`}
                alt=""
                width={1400}
                height={1750}
                sizes={f.size}
                className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4" data-reveal>
              <h3 className="display-sm">{f.title}</h3>
              <Icon name="diagonal" className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1.5 max-w-xs text-sm text-mute" data-reveal>{f.note}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
