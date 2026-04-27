import { useQuery } from '@tanstack/react-query'
import { catalogService } from '@/features/catalog/services/catalogService'

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => catalogService.getProductById(id),
    enabled: Boolean(id),
  })
}
