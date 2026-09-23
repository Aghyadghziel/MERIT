import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { BRAND } from '@/lib/brand';
import { getProduct, getStory, stories } from '@/lib/catalog';

export const dynamicParams = false;
export const generateStaticParams = () => stories.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: PageProps<'/editorial/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return {
    title: story.title,
    description: story.standfirst,
    alternates: { canonical: `/editorial/${story.slug}` },
    openGraph: {
      type: 'article',
      title: story.title,
      description: story.standfirst,
      images: [{ url: `/img/${story.cover}.webp` }],
    },
  };
}

export default async function StoryPage({ params }: PageProps<'/editorial/[slug]'>) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const shop = story.shop.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const others = stories.filter((s) => s.slug !== story.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.standfirst,
    image: `${BRAND.domain}/img/${story.cover}.webp`,
    author: { '@type': 'Organization', name: BRAND.name },
    publisher: { '@type': 'Organization', name: BRAND.name },
    datePublished: `${story.year}-09-01`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <header className="on-ink relative bg-ink text-bone" data-header-over>
          <div className="frame h-[58svh] min-h-[20rem] md:h-[76svh]">
            <Image
              src={`/img/${story.images[0]}.webp`}
              alt=""
              width={2560}
              height={1440}
              sizes="100vw"
              priority
              className="opacity-90"
            />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/62 to-transparent" />
          <div className="page absolute inset-x-0 bottom-0 pb-10">
            <p className="label border-l border-bone/45 pl-4">
              {story.kicker} · {story.season} <span className="nums">{story.year}</span>
            </p>
            <h1 className="display-xl mt-5 max-w-4xl"><Lines text={story.title} /></h1>
          </div>
        </header>

        <div className="page grid-page section-y">
          <div className="col-span-4 md:col-span-6 lg:col-span-3">
            <div className="rule-t pt-4 lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <p className="label-sm text-mute">{story.kicker}</p>
              <p className="label-sm nums mt-2 text-mute">{story.readingTime} minute read</p>
              <Link href="/editorial" className="label link-rule mt-6 inline-flex items-center gap-2">
                <Icon name="arrowL" className="h-3.5 w-3.5" /> All stories
              </Link>
            </div>
          </div>

          <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-5">
            <p className="display-md" data-reveal>{story.standfirst}</p>
            <div className="mt-10 space-y-6 text-base leading-relaxed">
              {story.body.map((p, i) => (
                <p key={i} data-reveal className={i === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-6xl first-letter:leading-[0.82]' : undefined}>
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-14 grid gap-(--gutter) sm:grid-cols-2">
              {story.images.slice(1).map((img) => (
                <div key={img} className="frame frame-4-5" data-reveal-img>
                  <Image src={`/img/${img}.webp`} alt="" width={1400} height={1750} sizes="(min-width:640px) 32vw, 100vw" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {shop.length > 0 ? (
          <section className="page section-y-sm" aria-labelledby="shop-story">
            <div className="rule-t pt-4">
              <h2 id="shop-story" className="label">Pieces from this story</h2>
            </div>
            <div className="mt-10">
              <ProductGrid products={shop} columns={4} />
            </div>
          </section>
        ) : null}

        <section className="page section-y-sm" aria-labelledby="more-stories">
          <div className="rule-t pt-4">
            <h2 id="more-stories" className="label">More</h2>
          </div>
          <div className="mt-10 grid gap-x-(--gutter) gap-y-10 md:grid-cols-3">
            {others.map((s) => (
              <Link key={s.slug} href={`/editorial/${s.slug}`} className="group">
                <div className="frame frame-3-2" data-reveal-img>
                  <Image src={`/img/${s.cover}.webp`} alt="" width={1400} height={1750} sizes="(min-width:768px) 31vw, 100vw"
                    className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]" />
                </div>
                <p className="label-sm mt-3 text-mute">{s.kicker} · <span className="nums">{s.year}</span></p>
                <p className="display-sm mt-1.5">{s.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
