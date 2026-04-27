import { supabase } from '@/app/config/supabaseClient'
import type { Product } from '@/types/database.types'

export interface AggregatedItem {
  /** Clave única: `productId` para productos sin variante, `productId__variantId` para variantes */
  key: string
  product_id: string
  variant_id: string | null
  variant_label: string | null  // ej: "M / Negro"
  product: Pick<Product, 'id' | 'name' | 'sku' | 'images'>
  seller_quantity: number       // de pre-pedidos de vendedores
  own_stock_quantity: number    // de compra propia del admin
  total_quantity: number        // seller + own_stock
  order_count: number           // cantidad de pedidos de vendedores
  adjusted_quantity: number | null
}

export interface ContainerAggregation {
  container_id: string
  items: AggregatedItem[]
  total_orders: number
}

export const containerAggregationService = {
  async getAggregatedItems(containerId: string): Promise<AggregatedItem[]> {
    // Fetch ambas fuentes en paralelo
    const [orderItemsResult, stockItemsResult] = await Promise.all([
      supabase
        .from('order_items')
        .select(
          'product_id, variant_id, quantity, fulfillment_source, product:products!product_id(id, name, sku, images), variant:product_variants!variant_id(label), order:orders!order_id(id, container_id, status)',
        )
        .eq('order.container_id', containerId)
        .neq('order.status', 'cancelled'),
      supabase
        .from('container_stock_items')
        .select('product_id, variant_id, ordered_qty, product:products!product_id(id, name, sku, images), variant:product_variants!variant_id(label)')
        .eq('container_id', containerId),
    ])

    if (orderItemsResult.error) throw orderItemsResult.error
    if (stockItemsResult.error) throw stockItemsResult.error

    const map = new Map<string, AggregatedItem>()

    // ── Pedidos de vendedores (solo ítems de container) ────────────────────────
    for (const row of orderItemsResult.data ?? []) {
      const order = Array.isArray(row.order) ? row.order[0] : row.order
      if (!order || order.container_id !== containerId) continue
      if ((row as { fulfillment_source?: string; variant_id?: string | null }).fulfillment_source === 'stock') continue

      const product = Array.isArray(row.product) ? row.product[0] : row.product
      if (!product) continue

      const variantId = (row as { variant_id?: string | null }).variant_id ?? null
      const variantLabel = (row as { variant?: { label?: string } | null }).variant?.label ?? null
      const key = variantId ? `${row.product_id}__${variantId}` : row.product_id

      const existing = map.get(key)
      if (existing) {
        existing.seller_quantity += row.quantity
        existing.total_quantity += row.quantity
        existing.order_count += 1
      } else {
        map.set(key, {
          key,
          product_id: row.product_id,
          variant_id: variantId,
          variant_label: variantLabel,
          product: product as Pick<Product, 'id' | 'name' | 'sku' | 'images'>,
          seller_quantity: row.quantity,
          own_stock_quantity: 0,
          total_quantity: row.quantity,
          order_count: 1,
          adjusted_quantity: null,
        })
      }
    }

    // ── Compra propia del admin ────────────────────────────────────────────────
    for (const row of stockItemsResult.data ?? []) {
      const product = Array.isArray(row.product) ? row.product[0] : row.product
      if (!product) continue

      const variantId = (row as { variant_id?: string | null }).variant_id ?? null
      const variantLabel = (row as { variant?: { label?: string } | null }).variant?.label ?? null
      const key = variantId ? `${row.product_id}__${variantId}` : row.product_id

      const existing = map.get(key)
      if (existing) {
        existing.own_stock_quantity += row.ordered_qty
        existing.total_quantity += row.ordered_qty
      } else {
        map.set(key, {
          key,
          product_id: row.product_id,
          variant_id: variantId,
          variant_label: variantLabel,
          product: product as Pick<Product, 'id' | 'name' | 'sku' | 'images'>,
          seller_quantity: 0,
          own_stock_quantity: row.ordered_qty,
          total_quantity: row.ordered_qty,
          order_count: 0,
          adjusted_quantity: null,
        })
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const nameCmp = a.product.name.localeCompare(b.product.name)
      if (nameCmp !== 0) return nameCmp
      return (a.variant_label ?? '').localeCompare(b.variant_label ?? '')
    })
  },
}
