'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export type Overlay = 'search' | 'cart' | 'menu' | null;

type Ctx = {
  overlay: Overlay;
  open: (o: Exclude<Overlay, null>) => void;
  close: () => void;
};

const UiContext = createContext<Ctx | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  const open = useCallback((o: Exclude<Overlay, null>) => {
    opener.current = document.activeElement as HTMLElement | null;
    setOverlay(o);
  }, []);

  const close = useCallback(() => {
    setOverlay(null);
    // Send focus back where it came from, or the panel leaves the keyboard
    // user at the top of the document.
    requestAnimationFrame(() => opener.current?.focus?.());
  }, []);

  // Any navigation closes whatever is open.
  useEffect(() => { setOverlay(null); }, [pathname]);

  useEffect(() => {
    const body = document.body;
    if (overlay) {
      const bar = window.innerWidth - document.documentElement.clientWidth;
      body.style.setProperty('--scrollbar', `${bar}px`);
      body.dataset.locked = 'true';
    } else {
      delete body.dataset.locked;
      body.style.removeProperty('--scrollbar');
    }
    return () => {
      delete body.dataset.locked;
      body.style.removeProperty('--scrollbar');
    };
  }, [overlay]);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, close]);

  const value = useMemo(() => ({ overlay, open, close }), [overlay, open, close]);
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}
