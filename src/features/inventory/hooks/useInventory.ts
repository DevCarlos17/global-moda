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
  }[]).map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    images: p.images,
    price: p.price,
    stock_quantity: p.stock_quantity,
    category_id: p.category_id,
    category_name: p.categories?.name ?? null,
    is_active: p.is_active,
    variants: p.product_variants ?? [],
  }))
}

export function useInventoryProducts() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventoryProducts,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock actualizado')
    },
    onError: () => toast.error('Error al actualizar el stock'),
  })
}
