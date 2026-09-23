'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState,
} from 'react';
import type { CurrencyCode } from '@/lib/format';
import { getProduct } from '@/lib/catalog';

export type Line = { slug: string; colour: string; size: string; qty: number };

type State = {
  bag: Line[];
  wishlist: string[];
  recent: string[];
  currency: CurrencyCode;
};

const INITIAL: State = { bag: [], wishlist: [], recent: [], currency: 'SAR' };
const KEY = 'merit:v1';

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'add'; line: Line }
  | { type: 'setQty'; index: number; qty: number }
  | { type: 'remove'; index: number }
  | { type: 'clearBag' }
  | { type: 'wish'; slug: string }
  | { type: 'viewed'; slug: string }
  | { type: 'currency'; code: CurrencyCode };

const key = (l: Line) => `${l.slug}|${l.colour}|${l.size}`;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state };
    case 'add': {
      const at = state.bag.findIndex((l) => key(l) === key(action.line));
      if (at === -1) return { ...state, bag: [...state.bag, action.line] };
      const bag = [...state.bag];
      bag[at] = { ...bag[at], qty: Math.min(9, bag[at].qty + action.line.qty) };
      return { ...state, bag };
    }
    case 'setQty': {
      if (action.qty < 1) return { ...state, bag: state.bag.filter((_, i) => i !== action.index) };
      const bag = [...state.bag];
      bag[action.index] = { ...bag[action.index], qty: Math.min(9, action.qty) };
      return { ...state, bag };
    }
    case 'remove':
      return { ...state, bag: state.bag.filter((_, i) => i !== action.index) };
    case 'clearBag':
      return { ...state, bag: [] };
    case 'wish':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.slug)
          ? state.wishlist.filter((s) => s !== action.slug)
          : [action.slug, ...state.wishlist],
      };
    case 'viewed':
      if (state.recent[0] === action.slug) return state;
      return { ...state, recent: [action.slug, ...state.recent.filter((s) => s !== action.slug)].slice(0, 8) };
    case 'currency':
      return { ...state, currency: action.code };
  }
}

type Ctx = State & {
  /** False until localStorage has been read, so the server and client agree. */
  ready: boolean;
  count: number;
  subtotal: number;
  /** The last thing that happened, announced to screen readers. */
  message: string;
  add: (line: Line) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clearBag: () => void;
  toggleWish: (slug: string) => void;
  markViewed: (slug: string) => void;
  setCurrency: (code: CurrencyCode) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: 'hydrate', state: JSON.parse(raw) as Partial<State> });
    } catch {
      // A blocked or full localStorage is not a reason to break the shop.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const add = useCallback((line: Line) => {
    dispatch({ type: 'add', line });
    const p = getProduct(line.slug);
    setMessage(`${p?.name ?? 'Item'}, ${line.colour}, size ${line.size} added to your bag.`);
  }, []);

  const remove = useCallback((index: number) => {
    dispatch({ type: 'remove', index });
    setMessage('Item removed from your bag.');
  }, []);

  const toggleWish = useCallback((slug: string) => {
    dispatch({ type: 'wish', slug });
    setMessage('Wishlist updated.');
  }, []);

  const setQty = useCallback((index: number, qty: number) => dispatch({ type: 'setQty', index, qty }), []);
  const clearBag = useCallback(() => dispatch({ type: 'clearBag' }), []);
  const markViewed = useCallback((slug: string) => dispatch({ type: 'viewed', slug }), []);
  const setCurrency = useCallback((code: CurrencyCode) => dispatch({ type: 'currency', code }), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const line of state.bag) {
      const p = getProduct(line.slug);
      if (!p) continue;
      c += line.qty;
      s += p.price * line.qty;
    }
    return { count: c, subtotal: s };
  }, [state.bag]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      count,
      subtotal,
      message,
      add,
      remove,
      toggleWish,
      setQty,
      clearBag,
      markViewed,
      setCurrency,
    }),
    [state, ready, count, subtotal, message, add, remove, toggleWish, setQty, clearBag, markViewed, setCurrency],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <p aria-live="polite" role="status" className="sr-only">{message}</p>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Free shipping inside the Gulf above this amount, in SAR. */
export const FREE_SHIPPING = 1500;
