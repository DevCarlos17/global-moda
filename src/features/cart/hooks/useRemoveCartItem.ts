import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartService } from '@/features/cart/services/cartService'
import { useCartStore } from '@/features/cart/store/cartStore'

interface RemoveCartItemParams {
  id: string
  productId: string
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  const removeItem = useCartStore((s) => s.removeItem)

  return useMutation({
    mutationFn: ({ id }: RemoveCartItemParams) => cartService.removeItem(id),
    onMutate: ({ id }) => {
      removeItem(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.error(error.message || 'Error al eliminar del carrito')
    },
  })
}
