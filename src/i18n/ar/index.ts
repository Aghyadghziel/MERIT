/**
 * Arabic, keyed by the English source string. Split by area so each part of
 * the site keeps its own file; merged here. (Product copy is separate: see
 * src/i18n/products.ts.)
 */
import { catalog } from './catalog';
import { common } from './common';
import { editorial } from './editorial';
import { home } from './home';
import { listing } from './listing';
import { pages } from './pages';
import { product } from './product';
import { shell } from './shell';

export const AR: Record<string, string> = {
  ...common, ...catalog, ...home, ...shell, ...listing, ...product, ...editorial, ...pages,
};
