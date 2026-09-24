'use client';

import NextLink from 'next/link';
import { forwardRef } from 'react';
import { localePath } from './config';
import { useLocale } from './client';

type Props = React.ComponentProps<typeof NextLink>;

/**
 * next/link that keeps the reader in their language: internal hrefs get the
 * /ar prefix on Arabic pages. Everything else passes straight through.
 */
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, ...rest }, ref) {
  const locale = useLocale();
  const to = typeof href === 'string' ? localePath(href, locale)
    : href && typeof href === 'object' && typeof href.pathname === 'string' ? { ...href, pathname: localePath(href.pathname, locale) }
      : href;
  return <NextLink ref={ref} href={to} {...rest} />;
});

export default Link;
