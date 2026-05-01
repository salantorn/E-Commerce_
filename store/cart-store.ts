// store/cart-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItemState } from "@/types";

interface CartStore {
  items:     CartItemState[];
  isOpen:    boolean;
  isLoading: boolean;

  // Actions
  addItem:      (item: CartItemState) => void;
  removeItem:   (productId: string, variantId?: string) => void;
  updateQty:    (productId: string, quantity: number, variantId?: string) => void;
  clearCart:    () => void;
  openCart:     () => void;
  closeCart:    () => void;
  toggleCart:   () => void;
  setLoading:   (v: boolean) => void;
  syncWithServer: (items: CartItemState[]) => void;

  // Computed (getters)
  itemCount:  () => number;
  subtotal:   () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:     [],
      isOpen:    false,
      isLoading: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId && i.variantId === newItem.variantId
                  ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQty: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        }));
      },

      clearCart:    () => set({ items: [] }),
      openCart:     () => set({ isOpen: true }),
      closeCart:    () => set({ isOpen: false }),
      toggleCart:   () => set((s) => ({ isOpen: !s.isOpen })),
      setLoading:   (v) => set({ isLoading: v }),
      syncWithServer: (items) => set({ items }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal:  () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name:    "shopnext-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
