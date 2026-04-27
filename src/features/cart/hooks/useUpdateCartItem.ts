import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartService } from '@/features/cart/services/cartService'
import { useCartStore } from '@/features/cart/store/cartStore'

interface UpdateCartItemParams {
  id: string
  quantity: number
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const updateItem = useCartStore((s) => s.updateItem)

  return useMutation({
    mutationFn: ({ id, quantity }: UpdateCartItemParams) =>
      cartService.updateItem(id, quantity),
    onMutate: ({ id, quantity }) => {
      // Optimistic update
      updateItem(id, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.error(error.message || 'Error al actualizar el carrito')
    },
  })
}
