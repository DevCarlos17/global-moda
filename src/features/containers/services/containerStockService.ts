import { supabase } from '@/app/config/supabaseClient'
import type { ContainerStockItemWithProduct } from '@/types/database.types'

export const containerStockService = {
  async getByContainer(containerId: string): Promise<ContainerStockItemWithProduct[]> {
    const { data, error } = await supabase
      .from('container_stock_items')
      .select(
        '*, product:products!product_id(id, name, sku, images, stock_quantity), variant:product_variants!variant_id(id, label, stock_quantity)',
      )
      .eq('container_id', containerId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as ContainerStockItemWithProduct[]
  },

  async upsertItem(
    containerId: string,
    productId: string,
    variantId: string | null,
    orderedQty: number,
    notes?: string,
  ) {
    // Los índices parciales no funcionan con onConflict de PostgREST,
    // así que hacemos fetch + insert/update manualmente.
    let checkQuery = supabase
      .from('container_stock_items')
      .select('id')
      .eq('container_id', containerId)
      .eq('product_id', productId)

    checkQuery = variantId
      ? checkQuery.eq('variant_id', variantId)
      : checkQuery.is('variant_id', null)

    const { data: existing } = await checkQuery.maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('container_stock_items')
        .update({ ordered_qty: orderedQty, notes: notes ?? null })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('container_stock_items')
      .insert({ container_id: containerId, product_id: productId, variant_id: variantId, ordered_qty: orderedQty, notes: notes ?? null })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase.from('container_stock_items').delete().eq('id', itemId)
    if (error) throw error
  },

  async receiveStock(
    containerId: string,
    items: { product_id: string; variant_id: string | null; received_qty: number }[],
  ): Promise<void> {
    const { error } = await supabase.rpc('receive_container_stock', {
      p_container_id: containerId,
      p_items: items,
    })
    if (error) throw error
  },

  async setStock(productId: string, variantId: string | null, quantity: number): Promise<void> {
    const { error } = await supabase.rpc('set_product_stock', {
      p_product_id: productId,
      p_variant_id: variantId,
      p_quantity: quantity,
    })
    if (error) throw error
  },
}
