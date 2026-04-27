import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PublicCartItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  variantId?: string
  variantLabel?: string
}

interface PublicCartState {
  items: PublicCartItem[]
  isOpen: boolean
  addItem: (item: Omit<PublicCartItem, 'quantity'> & { quantity?: number; variantId?: string; variantLabel?: string }) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const usePublicCartStore = create<PublicCartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: ({ quantity: qty = 1, ...item }) => {
        // Unique by productId + variantId combination
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId,
        )
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + qty }
                : i,
            ),
            isOpen: true,
          })
        } else {
          set({ items: [...get().items, { ...item, quantity: qty }], isOpen: true })
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        })
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      clearCart: () => set({ items: [] }),

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: 'gm-public-cart' },
  ),
)
