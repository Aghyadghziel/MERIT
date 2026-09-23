import { Lines } from '@/components/ui/Lines';

/** The shared shell for the written pages: a title on a rule, then prose. */
export function TextPage({
  eyebrow, title, standfirst, children, aside,
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="page pt-(--nav-h)">
      <header className="section-y-sm max-w-3xl">
        <p className="label text-mute" data-reveal>{eyebrow}</p>
        <h1 className="display-lg mt-4"><Lines text={title} /></h1>
        {standfirst ? <p className="body-lg mt-6 max-w-xl text-mute" data-reveal>{standfirst}</p> : null}
      </header>

      <div className="grid-page rule-t pb-(--section) pt-10">
        {aside ? <div className="col-span-4 md:col-span-6 lg:col-span-3">{aside}</div> : null}
        <div className={aside ? 'col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-5' : 'col-span-4 md:col-span-6 lg:col-span-8'}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line py-8 first:border-0 first:pt-0">
      <h2 className="display-sm" data-reveal>{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-mute" data-reveal>{children}</div>
    </section>
  );
}
