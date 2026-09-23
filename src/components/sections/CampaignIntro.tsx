import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';

/** Four lines on a rule. The carousel underneath is the picture. */
export function CampaignIntro() {
  return (
    <section className="page pt-[calc(var(--nav-h)+2rem)] md:pt-[calc(var(--nav-h)+3rem)]" aria-labelledby="intro-title">
      <div className="grid-page items-end pb-4 md:pb-6">
        <div className="col-span-4 md:col-span-6 lg:col-span-8">
          <p className="label border-l border-ink/40 pl-4 text-mute" data-reveal>Autumn Winter 2026 · Foundation</p>
          <h1 id="intro-title" className="display-lg mt-5"><Lines text="One tee. Four ways out of the door." /></h1>
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-4">
          <p className="body-lg max-w-sm text-mute" data-reveal>
            The outerwear is cut over the same tee and the same trouser. Turn the rail and see how each one sits.
          </p>
          <Link href="/editorial/the-rule-line" className="label group mt-5 inline-flex items-center gap-2" data-reveal>
            View the campaign
            <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
