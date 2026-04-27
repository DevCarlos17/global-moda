import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { variantService } from '@/features/variants/services/variantService'

type UpdatePayload = Partial<Omit<import('@/types/database.types').ProductVariant, 'id' | 'created_at' | 'product_id'>>

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      variantService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Variante actualizada')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
