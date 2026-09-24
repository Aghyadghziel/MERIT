import { NextResponse, type NextRequest } from 'next/server';

/**
 * English lives at the root, Arabic under /ar. Every English URL is served
 * from the [lang]=en routes by an internal rewrite, so the address bar never
 * shows /en; an explicit /en/... is redirected to the clean URL.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/ar' || pathname.startsWith('/ar/')) return NextResponse.next();
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Not for Next internals, metadata routes or any file with an extension.
  matcher: ['/((?!_next|api|robots\\.txt|sitemap\\.xml|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};
