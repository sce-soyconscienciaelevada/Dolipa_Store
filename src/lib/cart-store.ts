import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productSlug: string;
  productName: string;
  size: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.sku === item.sku);
        if (existing) {
          set({
            items: get().items.map((i) => (i.sku === item.sku ? { ...i, qty: i.qty + item.qty } : i)),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (sku) => set({ items: get().items.filter((i) => i.sku !== sku) }),
      setQty: (sku, qty) =>
        set({
          items: get().items.map((i) => (i.sku === sku ? { ...i, qty } : i)),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "dolipa-cart" }
  )
);

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function formatARSPlain(price: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    price
  );
}
