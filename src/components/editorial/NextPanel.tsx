import Link from '@/i18n/link';
import { Icon } from '@/components/ui/Icon';
import { Lines } from '@/components/ui/Lines';
import { ArtImage } from '@/components/editorial/ArtImage';
import { isWide } from '@/components/editorial/data';
import { Poster } from '@/components/editorial/Poster';
import { Stage } from '@/components/editorial/Stage';

type Props = {
  href: string;
  /** "Next story", "Next collection". */
  eyebrow: string;
  /** "02 / 04". */
  position: string;
  title: string;
  /** Set the title edge to edge in capitals, as a collection name. */
  poster?: boolean;
  meta: string;
  dek: string;
  cta: string;
  wide: string;
  tall?: string;
  alt: string;
  id: string;
};

/**
 * The last page turns into the next one: a full-bleed opener for whatever
 * follows, already moving under the reader's thumb. The whole panel is one
 * link, named for where it goes.
 */
export function NextPanel({ href, eyebrow, position, title, poster, meta, dek, cta, wide, tall, alt, id }: Props) {
  return (
    <Stage
      aria-labelledby={id}
      className="group on-ink relative h-[92svh] min-h-[36rem] overflow-hidden bg-ink text-bone"
    >
      <div data-drift="16" className="absolute inset-x-0 -top-[8%] h-[116%]">
        <div className="h-full w-full transition-transform duration-[1600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
          {/* The layer is 92svh plus its drift, so a crop is drawn at whichever
              of that height or the full width it fills first. */}
          <ArtImage
            wide={wide}
            tall={tall}
            alt={alt}
            sizes={isWide(wide) ? 'max(100vw, 190svh)' : 'max(100vw, 86svh)'}
            tallSizes={tall && !isWide(tall) ? 'max(100vw, 86svh)' : 'max(100vw, 190svh)'}
            className="opacity-80"
          />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/45" />

      <div className="page relative flex h-full flex-col justify-between pb-(--gutter) pt-10 md:pt-14">
        <div className="flex items-baseline justify-between gap-6 border-t border-bone/35 pt-4">
          <p className="label">{eyebrow}</p>
          <p className="label nums text-bone/70">{position}</p>
        </div>

        <div>
          <p className="label mb-5 text-bone/75" data-reveal>{meta}</p>
          {poster ? (
            <Poster as="h2" id={id} text={title} cap="30svh" />
          ) : (
            <h2 id={id} className="display-xl max-w-[13ch]"><Lines text={title} /></h2>
          )}
          <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p className="body-lg max-w-md text-bone/80" data-reveal>{dek}</p>
            <span aria-hidden className="btn btn-solid shrink-0 self-start md:self-auto" data-reveal>
              {cta}
              <Icon name="arrowR" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>

      <Link
        href={href}
        className="absolute inset-0 z-10 focus-visible:outline-offset-[-8px]"
        aria-label={`${eyebrow}: ${title}`}
      />
    </Stage>
  );
}
