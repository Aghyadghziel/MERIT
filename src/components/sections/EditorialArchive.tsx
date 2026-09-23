import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Story } from '@/lib/catalog';

/** Large covers, set two up, with the metadata on a rule beneath. */
export function EditorialArchive({ stories, index }: { stories: Story[]; index: number }) {
  return (
    <section className="page section-y" aria-labelledby="editorial-title">
      <SectionHead
        index={index}
        title="Editorial and runway"
        link={{ label: 'All stories', href: '/editorial' }}
        as="h2"
      />
      <h2 id="editorial-title" className="sr-only">Editorial and runway</h2>

      <div className="mt-12 grid gap-x-(--gutter) gap-y-14 md:mt-16 md:grid-cols-2">
        {stories.map((story, i) => (
          <article key={story.slug} className={i % 2 === 1 ? 'md:mt-20' : undefined}>
            <Link href={`/editorial/${story.slug}`} className="group block">
              <div className="frame frame-3-2" data-reveal-img>
                <Image
                  src={`/img/${story.cover}.webp`}
                  alt=""
                  width={1400}
                  height={1750}
                  sizes="(min-width:768px) 48vw, 100vw"
                  className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
                />
              </div>
              <div className="rule-t mt-4 flex items-baseline justify-between gap-4 pt-3" data-reveal>
                <p className="label-sm text-mute">
                  {story.kicker} · {story.season} <span className="nums">{story.year}</span>
                </p>
                <span className="label inline-flex items-center gap-2">
                  View story
                  <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
              <h3 className="display-md mt-3 max-w-lg" data-reveal>{story.title}</h3>
              <p className="mt-3 max-w-md text-sm text-mute" data-reveal>{story.standfirst}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
