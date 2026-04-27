import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/app/config/supabaseClient'

/**
 * Supabase Realtime subscription for catalog tables (products, variants, categories).
 *
 * Mounted in both AdminLayout and SellerLayout so that:
 *  - Sellers see price changes, new stock, new variants and categories instantly.
 *  - Admins see product/inventory lists update in real time after any mutation.
 */
export function useProductsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const invalidateCatalog = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }

    const productsChannel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, invalidateCatalog)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, (payload) => {
        invalidateCatalog()
        // Also invalidate the specific product's variants
        const productId = (payload.new as Record<string, unknown>)?.product_id
          ?? (payload.old as Record<string, unknown>)?.product_id
        if (productId) {
          queryClient.invalidateQueries({ queryKey: ['variants', productId] })
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(productsChannel)
    }
  }, [queryClient])
}
