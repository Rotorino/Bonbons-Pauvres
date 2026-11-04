'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { products, type Product } from '@/data/catalog';

type CartLine = { productId: number; quantity: number };
type CartContextValue = { lines: CartLine[]; open: boolean; setOpen(open: boolean): void; add(productId: number): void; change(productId: number, delta: number): void; remove(productId: number): void; clear(): void; count: number; total: number; items: Array<CartLine & { product: Product }> };
const CartContext = createContext<CartContextValue | null>(null);
const key = 'bonbons-pauvres-cart-v2';

function readCart(): CartLine[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((line): CartLine[] => typeof line === 'object' && line !== null && 'productId' in line && 'quantity' in line && Number.isInteger(line.productId) && Number.isInteger(line.quantity) && line.quantity > 0 ? [{ productId: Number(line.productId), quantity: Math.min(Number(line.quantity), 20) }] : []);
  } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]); const [open, setOpen] = useState(false);
  const hydrated = useRef(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => { hydrated.current = true; setLines(readCart()); });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (hydrated.current) localStorage.setItem(key, JSON.stringify(lines)); }, [lines]);
  const value = useMemo<CartContextValue>(() => {
    const change = (productId: number, delta: number) => setLines(current => current.flatMap(line => line.productId !== productId ? [line] : line.quantity + delta > 0 ? [{ ...line, quantity: Math.min(20, line.quantity + delta) }] : []));
    const items = lines.flatMap(line => { const product = products.find(item => item.id === line.productId); return product ? [{ ...line, product }] : []; });
    return { lines, open, setOpen, add: (productId) => { setLines(current => current.some(line => line.productId === productId) ? current.map(line => line.productId === productId ? { ...line, quantity: Math.min(line.quantity + 1, 20) } : line) : [...current, { productId, quantity: 1 }]); setOpen(true); }, change, remove: (id) => setLines(current => current.filter(line => line.productId !== id)), clear: () => setLines([]), count: lines.reduce((sum, line) => sum + line.quantity, 0), total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), items };
  }, [lines, open]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used inside CartProvider'); return value; }
