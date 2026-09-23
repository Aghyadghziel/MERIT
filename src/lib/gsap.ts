'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * GSAP is only ever touched on the client, and the plugin is registered once.
 * Importing this module from a server component would throw, which is the
 * point — every animation lives behind a 'use client' boundary.
 */
export function setupGsap() {
  if (registered || typeof window === 'undefined') return { gsap, ScrollTrigger };
  gsap.registerPlugin(ScrollTrigger);
  // Keep a long frame (an image decoding, a filter being applied) from making
  // GSAP skip ahead and snap a reveal to its end state.
  gsap.ticker.lagSmoothing(280, 22);
  registered = true;
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };

export const EASE = {
  /** Interface feedback — buttons, chips, counters. */
  ui: 'power2.out',
  /** Editorial reveals — headlines, cards, images. */
  reveal: 'power3.out',
  /** Large moves — drawers, menus, campaign imagery. */
  big: 'power4.out',
  /** Reserved for the few transitions that should feel like a cut. */
  cut: 'expo.out',
} as const;

export const DUR = {
  fast: 0.18,
  ui: 0.24,
  panel: 0.42,
  reveal: 0.7,
  image: 1.0,
} as const;

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
