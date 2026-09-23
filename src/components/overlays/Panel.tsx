'use client';

import { useEffect, useRef } from 'react';
import { DUR, EASE, reduced, setupGsap } from '@/lib/gsap';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  /** Where the panel comes from. */
  from: 'right' | 'top';
  children: React.ReactNode;
  className?: string;
  /** Called once the exit animation has finished. */
  onClosed?: () => void;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * The shared shell for the bag, the search and the mobile menu: a scrim, a
 * panel, a focus trap and one pair of GSAP transitions. Keeping it in one
 * place is what stops the three overlays drifting apart.
 */
export function Panel({ open, onClose, label, from, children, className, onClosed }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap } = setupGsap();
    tl.current?.kill();

    if (reduced()) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      gsap.set(panel.current, { xPercent: 0, yPercent: 0, opacity: 1 });
      if (!open) onClosed?.();
      return;
    }

    const axis = from === 'right' ? 'xPercent' : 'yPercent';
    if (open) {
      gsap.set(el, { autoAlpha: 1 });
      const t = gsap.timeline();
      t.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: DUR.panel, ease: EASE.ui }, 0)
        .fromTo(
          panel.current,
          { [axis]: from === 'right' ? 100 : -100 },
          { [axis]: 0, duration: DUR.panel, ease: EASE.big },
          0,
        )
        .fromTo(
          el.querySelectorAll('[data-panel-item]'),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.38, ease: EASE.reveal, stagger: 0.04 },
          0.14,
        );
      tl.current = t;
    } else {
      const t = gsap.timeline({
        onComplete: () => { gsap.set(el, { autoAlpha: 0 }); onClosed?.(); },
      });
      t.to(panel.current, { [axis]: from === 'right' ? 100 : -100, duration: 0.3, ease: EASE.ui }, 0)
        .to(scrim.current, { opacity: 0, duration: 0.3, ease: EASE.ui }, 0);
      tl.current = t;
    }
    return () => { tl.current?.kill(); };
  }, [open, from, onClosed]);

  // Focus goes into the panel on open and is kept there while it is open.
  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>(FOCUSABLE);
    const t = window.setTimeout(() => first?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (n) => n.offsetParent !== null,
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
  }, [open]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[70] invisible opacity-0"
      aria-hidden={!open}
      inert={!open}
    >
      <div
        ref={scrim}
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          'absolute bg-bone',
          from === 'right'
            ? 'inset-y-0 right-0 flex w-full max-w-[29rem] flex-col'
            : 'inset-x-0 top-0 flex max-h-dvh flex-col',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
