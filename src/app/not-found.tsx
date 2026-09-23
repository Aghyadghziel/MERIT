import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/ui/Lines';

export default function NotFound() {
  return (
    <div className="page pt-(--nav-h)">
      <div className="grid-page section-y items-center">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <p className="label nums text-mute">Error 404</p>
          <h1 className="display-lg mt-4"><Lines text="This page has been taken down." /></h1>
          <p className="body-lg mt-6 max-w-md text-mute">
            Pieces are made in small counts and the pages go with them. The link may have been
            correct once.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/new" className="btn btn-solid">New arrivals</Link>
            <Link href="/collections" className="btn">Collections</Link>
            <Link href="/" className="btn btn-ghost">Home</Link>
          </div>
        </div>

        <div className="col-span-4 mt-12 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:mt-0">
          <div className="frame frame-4-5">
            <Image src="/img/manifesto-rail.webp" alt="" width={2560} height={1440} sizes="(min-width:1024px) 40vw, 100vw" />
          </div>
        </div>
      </div>
    </div>
  );
}
