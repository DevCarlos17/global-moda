import { catalogService } from '@/features/catalog/services/catalogService'
import type { Product } from '@/types/database.types'

// Re-export catalog service with admin-specific options
export const productAdminService = {
  getAllProducts: () => catalogService.getAllProducts({}),

  createProduct: (payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
    catalogService.createProduct(payload),

  updateProduct: (id: string, payload: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) =>
    catalogService.updateProduct(id, payload),

  deleteProduct: (id: string) => catalogService.deleteProduct(id),
}
