'use client';

import { useEffect, useRef } from 'react';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  /**
   * Where the panel comes from.
   *  right  a drawer (the bag), from the end side: the right in English,
   *         the left in Arabic
   *  top    a sheet that drops over the header, with a scrim (search)
   *  full   the whole screen, no scrim (the mobile menu)
   */
  from: 'right' | 'top' | 'full';
  children: React.ReactNode;
  /** Classes for the sheet. */
  className?: string;
  /**
   * Classes for the fixed root. A panel that only exists at some widths
   * (the phone menu) must hide its root too, not just the sheet, or the
   * empty root goes on covering the page at the other widths.
   */
  rootClassName?: string;
  /** Called once the exit animation has finished. */
  onClosed?: () => void;
  /** What takes focus on open. Defaults to the first focusable element. */
  initialFocus?: React.RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const SHUT = 'inset(0% 0% 100% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';

/**
 * The shared shell for the bag, the search and the mobile menu: a scrim, a
 * panel, a focus trap and one set of GSAP transitions. Keeping it in one
 * place is what stops the three overlays drifting apart.
 *
 * Inside, two hooks animate on open without any wiring:
 *   data-panel-item   fades and lifts, staggered
 *   data-panel-line   slides up out of its parent's mask (give the parent
 *                     overflow-hidden), for type set at display size
 */
export function Panel({ open, onClose, label, from, children, className, rootClassName, onClosed, initialFocus }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const el = root.current;
    const sheet = panel.current;
    if (!el || !sheet) return;
    const { gsap } = setupGsap();
    tl.current?.kill();
    const items = el.querySelectorAll('[data-panel-item]');
    const lines = el.querySelectorAll('[data-panel-line]');
    // The drawer is pinned to the end side, so it comes in from the left on
    // an Arabic page.
    const off = document.documentElement.dir === 'rtl' ? -100 : 100;

    if (reduced()) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      gsap.set(sheet, { xPercent: 0, yPercent: 0, clipPath: 'none', opacity: 1 });
      gsap.set(items, { clearProps: 'opacity,transform' });
      gsap.set(lines, { clearProps: 'transform' });
      if (!open && wasOpen.current) onClosed?.();
      wasOpen.current = open;
      return;
    }

    if (open) {
      wasOpen.current = true;
      gsap.set(el, { autoAlpha: 1 });
      const t = gsap.timeline();
      if (from === 'right') {
        t.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: DUR.panel, ease: EASE.ui }, 0)
          .fromTo(sheet, { xPercent: off }, { xPercent: 0, duration: 0.62, ease: EASE.cut }, 0);
      } else {
        // top and full are the same gesture: a blind drawn down from the
        // header line, fast off the mark and slow to settle.
        if (from === 'top') {
          t.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: EASE.ui }, 0);
        }
        t.fromTo(sheet, { clipPath: SHUT }, { clipPath: OPEN, duration: from === 'full' ? 0.85 : 0.7, ease: EASE.cut }, 0);
      }
      t.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: EASE.cut, stagger: 0.045 }, from === 'right' ? 0.12 : 0.16)
        .fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE.reveal, stagger: 0.035 }, from === 'right' ? 0.14 : 0.26);
      tl.current = t;
    } else {
      if (!wasOpen.current) {
        gsap.set(el, { autoAlpha: 0 });
        return;
      }
      wasOpen.current = false;
      const t = gsap.timeline({
        onComplete: () => { gsap.set(el, { autoAlpha: 0 }); onClosed?.(); },
      });
      if (from === 'right') {
        t.to(sheet, { xPercent: off, duration: 0.36, ease: 'power3.in' }, 0);
      } else {
        t.to(sheet, { clipPath: SHUT, duration: from === 'full' ? 0.55 : 0.42, ease: 'power3.inOut' }, 0);
      }
      // The full-screen panel has no scrim to fade.
      if (scrim.current) t.to(scrim.current, { opacity: 0, duration: 0.36, ease: EASE.ui }, 0);
      tl.current = t;
    }
    return () => { tl.current?.kill(); };
  }, [open, from, onClosed]);

  // Focus goes into the panel on open and is kept there while it is open.
  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      const target = initialFocus?.current ?? el.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus({ preventScroll: true });
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (n) => n.offsetParent !== null && !n.closest('[inert]'),
      );
      if (!items.length) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(t); el.removeEventListener('keydown', onKey); };
  }, [open, initialFocus]);

  return (
    <div
      ref={root}
      className={cn('fixed inset-0 z-[70] invisible opacity-0', rootClassName)}
      aria-hidden={!open}
      inert={!open}
    >
      {from !== 'full' ? (
        <div
          ref={scrim}
          className="absolute inset-0 bg-ink/40"
          onClick={onClose}
          aria-hidden
        />
      ) : null}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          'absolute bg-bone',
          from === 'right' && 'inset-y-0 end-0 flex w-full max-w-[29rem] flex-col',
          from === 'top' && 'inset-x-0 top-0 flex max-h-dvh flex-col',
          from === 'full' && 'inset-0 flex h-dvh flex-col',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
