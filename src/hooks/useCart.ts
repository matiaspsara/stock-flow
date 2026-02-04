"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export type CartItem = {
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  current_stock: number;
  subtotal: number;
};

type Discount = { type: "amount" | "percent"; value: number };

type CartState = {
  items: CartItem[];
  discount: Discount;
  addItem: (item: Omit<CartItem, "quantity" | "subtotal">) => void;
  removeItem: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  setDiscount: (discount: Discount) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: { type: "amount", value: 0 },
      addItem: (item) => {
        const existing = get().items.find((i) => i.product_id === item.product_id);
        if (existing) {
          if (existing.quantity + 1 > existing.current_stock) {
            toast.error(`Stock insuficiente (disponible: ${existing.current_stock})`);
            return;
          }
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id
                ? {
                    ...i,
                    quantity: i.quantity + 1,
                    subtotal: (i.quantity + 1) * i.unit_price
                  }
                : i
            )
          });
          return;
        }

        if (item.current_stock <= 0) {
          toast.error("Producto sin stock");
          return;
        }

        set({
          items: [
            ...get().items,
            {
              ...item,
              quantity: 1,
              subtotal: item.unit_price
            }
          ]
        });
      },
      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.product_id !== product_id) });
      },
      updateQuantity: (product_id, quantity) => {
        if (quantity < 0) return;
        set({
          items: get().items
            .map((i) => {
              if (i.product_id !== product_id) return i;
              if (quantity > i.current_stock) {
                toast.error(`Stock insuficiente (disponible: ${i.current_stock})`);
                return i;
              }
              if (quantity === 0) return null;
              return { ...i, quantity, subtotal: quantity * i.unit_price };
            })
            .filter(Boolean) as CartItem[]
        });
      },
      setDiscount: (discount) => set({ discount }),
      clearCart: () => set({ items: [], discount: { type: "amount", value: 0 } })
    }),
    { name: "stockflow-cart" }
  )
);

export function useCartTotals() {
  const items = useCart((s) => s.items);
  const discount = useCart((s) => s.discount);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount =
    discount.type === "percent" ? Math.round(subtotal * (discount.value / 100)) : discount.value;
  const total = Math.max(subtotal - discountAmount, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discountAmount, total, itemCount };
}
