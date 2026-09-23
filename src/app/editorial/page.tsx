import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { stories } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Campaigns, runway presentations and notes from the MERIT atelier.',
  alternates: { canonical: '/editorial' },
};

export default function EditorialPage() {
  const [lead, ...rest] = stories;
  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm max-w-3xl">
        <p className="label text-mute" data-reveal>Editorial</p>
        <h1 className="display-lg mt-4"><Lines text="Campaigns, runway and how things are made." /></h1>
      </header>

      <article className="rule-t pt-10">
        <Link href={`/editorial/${lead.slug}`} className="group grid-page items-end">
          <div className="col-span-4 md:col-span-6 lg:col-span-8">
            <div className="frame frame-3-2" data-reveal-img>
              <Image
                src={`/img/${lead.cover}.webp`}
                alt=""
                width={1400}
                height={1750}
                sizes="(min-width:1024px) 64vw, 100vw"
                priority
                className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
              />
            </div>
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-4">
            <p className="label-sm text-mute" data-reveal>
              {lead.kicker} · {lead.season} <span className="nums">{lead.year}</span>
            </p>
            <h2 className="display-md mt-3" data-reveal>{lead.title}</h2>
            <p className="mt-4 text-sm text-mute" data-reveal>{lead.standfirst}</p>
            <span className="label mt-6 inline-flex items-center gap-2" data-reveal>
              Read
              <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </article>

      <div className="grid gap-x-(--gutter) gap-y-14 pb-(--section) pt-16 md:grid-cols-3">
        {rest.map((story) => (
          <article key={story.slug}>
            <Link href={`/editorial/${story.slug}`} className="group block">
              <div className="frame frame-4-5" data-reveal-img>
                <Image
                  src={`/img/${story.cover}.webp`}
                  alt=""
                  width={1400}
                  height={1750}
                  sizes="(min-width:768px) 31vw, 100vw"
                  className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                />
              </div>
              <p className="label-sm mt-4 text-mute" data-reveal>
                {story.kicker} · <span className="nums">{story.year}</span> · {story.readingTime} min
              </p>
              <h2 className="display-sm mt-2" data-reveal>{story.title}</h2>
              <p className="mt-2 text-sm text-mute" data-reveal>{story.standfirst}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
