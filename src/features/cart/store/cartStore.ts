import { create } from 'zustand'
import type { CartItemWithProduct } from '@/types/database.types'

interface CartState {
  items: CartItemWithProduct[]
  isOpen: boolean
  setItems: (items: CartItemWithProduct[]) => void
  addItem: (item: CartItemWithProduct) => void
  updateItem: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => {
      // Unique by product_id + variant_id + fulfillment_source
      // Stock and pre-order items for the same product are separate lines
      const existing = state.items.find(
        (i) =>
          i.product_id === item.product_id &&
          i.variant_id === item.variant_id &&
          i.fulfillment_source === item.fulfillment_source,
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id &&
            i.variant_id === item.variant_id &&
            i.fulfillment_source === item.fulfillment_source
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          ),
        }
      }
      return { items: [...state.items, item] }
    }),

  updateItem: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}))
