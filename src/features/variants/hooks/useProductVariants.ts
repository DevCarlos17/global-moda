import { useQuery } from '@tanstack/react-query'
import { variantService } from '@/features/variants/services/variantService'

export function useProductVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ['variants', productId],
    queryFn: () => variantService.getByProductId(productId!),
    enabled: !!productId,
  })
}
