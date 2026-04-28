import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/app/config/supabaseClient'
import { containerStockService } from '@/features/containers/services/containerStockService'
import type { InventoryProduct } from '@/types/database.types'

async function fetchInventoryProducts(): Promise<InventoryProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, sku, name, images, price, stock_quantity, category_id, is_active, categories(name), product_variants(id, label, stock_quantity)',
    )
    .order('name', { ascending: true })
  if (error) throw error
  return ((data ?? []) as unknown as {
    id: string
    sku: string
    name: string
    images: string[]
    price: number
    stock_quantity: number
    category_id: string | null
    is_active: boolean
    categories: { name: string } | null
    product_variants: { id: string; label: string; stock_quantity: number }[] | null
  }[]).map((p) => {
    const variantList = p.product_variants ?? []
    const effectiveStock = variantList.length > 0
      ? variantList.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0)
      : p.stock_quantity
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      images: p.images,
      price: p.price,
      stock_quantity: effectiveStock,
      category_id: p.category_id,
      category_name: p.categories?.name ?? null,
      is_active: p.is_active,
      variants: variantList,
    }
  })
}

export function useInventoryProducts() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventoryProducts,
  })
}

// Patch the ['inventory'] cache immediately so the table updates without
// waiting for a round-trip refetch. invalidateQueries still fires a background
// refetch to confirm the DB values are correct.
function patchInventoryCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updates: { productId: string; variantId: string | null; quantity: number }[],
) {
  queryClient.setQueryData<InventoryProduct[]>(['inventory'], (old) => {
    if (!old) return old
    return old.map((product) => {
      const productUpdates = updates.filter((u) => u.productId === product.id)
      if (productUpdates.length === 0) return product

      const newVariants = product.variants.map((v) => {
        const up = productUpdates.find((u) => u.variantId === v.id)
        return up ? { ...v, stock_quantity: up.quantity } : v
      })

      // For no-variant products updated directly (variantId null)
      const directUpdate = productUpdates.find((u) => u.variantId === null)
      const newStock = newVariants.length > 0
        ? newVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
        : (directUpdate?.quantity ?? product.stock_quantity)

      return { ...product, variants: newVariants, stock_quantity: newStock }
    })
  })
}

export function useSetStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      quantity,
    }: {
      productId: string
      variantId: string | null
      quantity: number
    }) => containerStockService.setStock(productId, variantId, quantity),
    onSuccess: (_, { productId, variantId, quantity }) => {
      patchInventoryCache(queryClient, [{ productId, variantId, quantity }])
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['variants', productId] })
      toast.success('Stock actualizado')
    },
    onError: () => toast.error('Error al actualizar el stock'),
  })
}

export function useBulkSetStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: { productId: string; variantId: string | null; quantity: number }[]) =>
      Promise.all(
        updates.map(({ productId, variantId, quantity }) =>
          containerStockService.setStock(productId, variantId, quantity),
        ),
      ),
    onSuccess: (_, updates) => {
      patchInventoryCache(queryClient, updates)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      if (updates[0]) {
        queryClient.invalidateQueries({ queryKey: ['variants', updates[0].productId] })
      }
      toast.success('Stock actualizado')
    },
    onError: () => toast.error('Error al actualizar el stock'),
  })
}
