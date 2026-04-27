import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartService } from '@/features/cart/services/cartService'
import { useCartStore } from '@/features/cart/store/cartStore'
import type { AddToCartPayload } from '@/features/cart/types/cart.types'

export function useAddToCart() {
  const queryClient = useQueryClient()
  const { addItem, openCart } = useCartStore()

  return useMutation({
    mutationFn: ({ userId, productId, quantity, variantId, fulfillmentSource }: AddToCartPayload) =>
      cartService.addItem(userId, productId, quantity, variantId, fulfillmentSource),
    onSuccess: (item) => {
      addItem(item)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      const isPreorder = item.fulfillment_source === 'container'
      toast.success(isPreorder ? 'Pre-pedido agregado al carrito' : 'Producto agregado al carrito')
      openCart()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agregar al carrito')
    },
  })
}
