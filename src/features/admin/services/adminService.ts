import { supabase } from '@/app/config/supabaseClient'
import type {
  ExtendedDashboardStats,
  OrderWithDetails,
  OrderStatusCounts,
  RecentOrder,
  LowStockProduct,
  OrderStatus,
} from '@/types/database.types'

export const adminService = {
  async getUnassignedPreOrders(): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, items:order_items!order_id(*, product:products!product_id(*)), seller:profiles!seller_id(*)',
      )
      .is('container_id', null)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
    if (error) throw error
    // Only orders that have at least one pre-order item
    return ((data ?? []) as OrderWithDetails[]).filter((o) =>
      o.items?.some((i) => i.fulfillment_source === 'container'),
    )
  },

  async getOrders(): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, items:order_items!order_id(*, product:products!product_id(*)), seller:profiles!seller_id(*), container:containers!container_id(*)',
      )
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as OrderWithDetails[]
  },

  async updateItemFulfillmentSource(
    itemId: string,
    source: 'stock' | 'container' | null,
  ): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .update({ fulfillment_source: source })
      .eq('id', itemId)
    if (error) throw error
  },

  async updateOrderStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) throw error
  },

  async getPendingOrdersCount(): Promise<number> {
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (error) throw error
    return count ?? 0
  },

  async getDashboardStats(): Promise<ExtendedDashboardStats> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [ordersResult, productsResult, sellersResult, recentOrdersResult, lowStockResult] =
      await Promise.all([
        supabase.from('orders').select('id, status, total_amount, order_type, created_at'),
        supabase.from('products').select('id, is_active'),
        supabase.from('profiles').select('id').eq('role', 'seller'),
        supabase
          .from('orders')
          .select(
            'id, order_number, status, order_type, total_amount, created_at, customer_name, seller:profiles!seller_id(full_name)',
          )
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('products')
          .select('id, name, sku, stock_quantity')
          .lte('stock_quantity', 20)
          .eq('is_active', true)
          .order('stock_quantity', { ascending: true })
          .limit(5),
      ])

    if (ordersResult.error) throw ordersResult.error
    if (productsResult.error) throw productsResult.error
    if (sellersResult.error) throw sellersResult.error
    if (recentOrdersResult.error) throw recentOrdersResult.error
    if (lowStockResult.error) throw lowStockResult.error

    const orders = ordersResult.data ?? []
    const products = productsResult.data ?? []
    const sellers = sellersResult.data ?? []

    const activeStatuses: OrderStatus[] = [
      'confirmed', 'processing', 'awaiting_container',
      'in_transit', 'in_customs', 'in_warehouse',
      'shipped', 'delivered',
    ]

    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length
    const totalRevenue = orders
      .filter((o) => activeStatuses.includes(o.status as OrderStatus))
      .reduce((sum, o) => sum + (o.total_amount as number), 0)

    const statusCounts: OrderStatusCounts = {
      draft: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      awaiting_container: 0,
      in_transit: 0,
      in_customs: 0,
      in_warehouse: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const o of orders) {
      const s = o.status as keyof OrderStatusCounts
      if (s in statusCounts) statusCounts[s]++
    }

    const revenueFor = (from: string) =>
      orders
        .filter((o) => activeStatuses.includes(o.status as OrderStatus) && o.created_at >= from)
        .reduce((sum, o) => sum + (o.total_amount as number), 0)

    const recentOrders: RecentOrder[] = (recentOrdersResult.data ?? []).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      seller_name:
        o.seller && typeof o.seller === 'object' && !Array.isArray(o.seller)
          ? (o.seller as { full_name: string }).full_name
          : null,
      customer_name: o.customer_name ?? null,
      total_amount: o.total_amount,
      status: o.status as OrderStatus,
      order_type: o.order_type,
      created_at: o.created_at,
    }))

    const lowStockProducts: LowStockProduct[] = (lowStockResult.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock_quantity: p.stock_quantity,
    }))

    return {
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      totalRevenue,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.is_active).length,
      totalSellers: sellers.length,
      statusCounts,
      recentOrders,
      lowStockProducts,
      revenueToday: revenueFor(todayStart),
      revenueWeek: revenueFor(weekStart),
      revenueMonth: revenueFor(monthStart),
      sellerOrdersCount: orders.filter((o) => o.order_type === 'seller').length,
      customerOrdersCount: orders.filter((o) => o.order_type === 'customer').length,
    }
  },
}
