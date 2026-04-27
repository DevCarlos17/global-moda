import { useQuery } from '@tanstack/react-query'
import { catalogService } from '@/features/catalog/services/catalogService'
import type { ProductFilters } from '@/features/catalog/types/product.types'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogService.getProducts(filters),
  })
}

export function useAllProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', 'all', filters],
    queryFn: () => catalogService.getAllProducts(filters),
  })
}
