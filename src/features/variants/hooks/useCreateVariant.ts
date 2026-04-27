import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { variantService } from '@/features/variants/services/variantService'

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: variantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Variante agregada')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
