import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/types';

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  addItem: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  setNotes: (menuItemId: string, notes: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === line.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === line.menuItemId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...line, quantity }] };
        }),
      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
      setQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuItemId !== menuItemId)
              : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
        })),
      setNotes: (menuItemId, notes) =>
        set((state) => ({
          items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i)),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: 'bella-vista-cart' },
  ),
);

/** Derived selectors (use outside the store to avoid re-renders). */
export const selectCartCount = (s: CartState) =>
  s.items.reduce((total, i) => total + i.quantity, 0);

export const selectCartSubtotal = (s: CartState) =>
  s.items.reduce((total, i) => total + i.price * i.quantity, 0);
