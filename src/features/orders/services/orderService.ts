import { supabase } from '@/app/config/supabaseClient'
import { generateOrderNumber } from '@/utils/generateOrderNumber'
import { calculateLineSubtotal } from '@/utils/calculateTotals'
import type { Order, OrderListItem, OrderStatus, OrderWithDetails, CartItemWithProduct, ContainerStatus } from '@/types/database.types'

// ─── Container → Order status mapping ─────────────────────────────────────────

const CONTAINER_TO_ORDER_STATUS: Partial<Record<ContainerStatus, OrderStatus>> = {
  draft:      'confirmed',          // asignado al container aunque aún no esté pedido
  ordered:    'awaiting_container',
  in_transit: 'in_transit',
  in_customs: 'in_customs',
  arrived:    'in_warehouse',
  // cancelled is intentionally excluded — not auto-synced
}

// Statuses that are auto-managed by the container pipeline.
// When an order is removed from a container, these reset to 'pending'.
const CONTAINER_MANAGED_STATUSES = new Set<string>([
  'confirmed', 'awaiting_container', 'in_transit', 'in_customs', 'in_warehouse',
])

// Orders should only move forward. Higher rank = further along.
const ORDER_STATUS_RANK: Record<string, number> = {
  draft: 0, pending: 1, confirmed: 2, processing: 3,
  awaiting_container: 4, in_transit: 5, in_customs: 6, in_warehouse: 7,
  shipped: 8, delivered: 9, cancelled: 99,
}
import type { CreateOrderPayload } from '@/features/orders/types/order.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the open container's id AND current status in one query.
 * Needed so createOrder can immediately set the correct order status
 * instead of always defaulting to 'pending'.
 */
async function getOpenContainer(): Promise<{ id: string; status: ContainerStatus } | null> {
  const { data } = await supabase
    .from('containers')
    .select('id, status')
    .eq('order_window_open', true)
    .maybeSingle()
  return data ? { id: data.id, status: data.status as ContainerStatus } : null
}

/**
 * Builds order items from cart items.
 * fulfillment_source is already set by the seller's explicit choice in the cart.
 * 'stock' items come from current inventory; 'container' items are demand signals.
 */
function buildOrderItems(orderId: string, items: CartItemWithProduct[]) {
  return items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    quantity: item.quantity,
    unit_price: item.product.price,
    subtotal: calculateLineSubtotal(item.quantity, item.product.price),
    fulfillment_source: item.fulfillment_source,
  }))
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const orderService = {
  async createOrder(sellerId: string, payload: CreateOrderPayload): Promise<Order> {
    const { storeInfo, items, adminId } = payload

    const totalAmount = items.reduce(
      (sum, item) => sum + calculateLineSubtotal(item.quantity, item.product.price),
      0,
    )

    const orderNumber = generateOrderNumber()
    const openContainer = await getOpenContainer()

    // If this order has pre-order items and there's an open container,
    // start the order at the status matching the container's current stage
    // instead of always defaulting to 'pending'.
    const hasPreorderItems = items.some((i) => i.fulfillment_source === 'container')
    const mappedStatus = openContainer
      ? CONTAINER_TO_ORDER_STATUS[openContainer.status]
      : undefined
    const initialStatus: OrderStatus =
      hasPreorderItems && mappedStatus ? mappedStatus : 'pending'

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        seller_id: sellerId,
        admin_id: adminId,
        status: initialStatus,
        version: 1,
        parent_order_id: null,
        store_name: storeInfo.store_name,
        store_address: storeInfo.store_address || null,
        store_contact: storeInfo.store_contact || null,
        notes: storeInfo.notes || null,
        total_amount: totalAmount,
        container_id: openContainer?.id ?? null,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = buildOrderItems(order.id, items)
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Decrement stock for items fulfilled from stock
    const stockItems = items.filter((i) => i.fulfillment_source === 'stock')
    for (const item of stockItems) {
      const { error: stockError } = await supabase.rpc('adjust_product_stock', {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id ?? null,
        p_delta: -item.quantity,
      })
      if (stockError) throw stockError
    }

    return order
  },

  async createVersion(originalOrderId: string, sellerId: string, payload: CreateOrderPayload): Promise<Order> {
    const { data: original, error: fetchError } = await supabase
      .from('orders')
      .select('version, order_number')
      .eq('id', originalOrderId)
      .single()
    if (fetchError) throw fetchError

    const newVersion = original.version + 1
    const baseNumber = original.order_number.replace(/-V\d+$/, '')

    const { storeInfo, items, adminId } = payload
    const totalAmount = items.reduce(
      (sum, item) => sum + calculateLineSubtotal(item.quantity, item.product.price),
      0,
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: `${baseNumber}-V${newVersion}`,
        seller_id: sellerId,
        admin_id: adminId,
        status: 'pending',
        version: newVersion,
        parent_order_id: originalOrderId,
        store_name: storeInfo.store_name,
        store_address: storeInfo.store_address || null,
        store_contact: storeInfo.store_contact || null,
        notes: storeInfo.notes || null,
        total_amount: totalAmount,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = buildOrderItems(order.id, items)
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    return order
  },

  async cancelOrder(id: string): Promise<void> {
    // Fetch stock items to restore before cancelling
    const { data: stockItems, error: fetchError } = await supabase
      .from('order_items')
      .select('product_id, variant_id, quantity')
      .eq('order_id', id)
      .eq('fulfillment_source', 'stock')
    if (fetchError) throw fetchError

    // Cancel the order
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id)
    if (error) throw error

    // Restore stock for each stock item
    for (const item of stockItems ?? []) {
      const { error: stockError } = await supabase.rpc('adjust_product_stock', {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id ?? null,
        p_delta: item.quantity,
      })
      if (stockError) throw stockError
    }
  },

  async getOrdersByUser(userId: string): Promise<OrderListItem[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, container:containers!container_id(container_number, status, eta), items:order_items!order_id(fulfillment_source)',
      )
      .eq('seller_id', userId)
      .is('parent_order_id', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return ((data ?? []) as (Order & {
      container: OrderListItem['container']
      items: { fulfillment_source: string | null }[]
    })[]).map((o) => ({
      ...o,
      has_preorder: o.items?.some((i) => i.fulfillment_source === 'container') ?? false,
      has_stock: o.items?.some((i) => i.fulfillment_source === 'stock') ?? false,
    }))
  },

  async getOrderById(id: string): Promise<OrderWithDetails> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items!order_id(*, product:products!product_id(*)), seller:profiles!seller_id(*), admin:profiles!admin_id(*), container:containers!container_id(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as OrderWithDetails
  },

  async getVersions(rootOrderId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${rootOrderId},parent_order_id.eq.${rootOrderId}`)
      .order('version', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getAllOrders(): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items!order_id(*, product:products!product_id(*)), seller:profiles!seller_id(*), admin:profiles!admin_id(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as OrderWithDetails[]
  },

  async updateOrderStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },

  async assignToContainer(orderId: string, containerId: string): Promise<void> {
    // Get container status + current order status in one round-trip
    const [containerRes, orderRes] = await Promise.all([
      supabase.from('containers').select('status').eq('id', containerId).single(),
      supabase.from('orders').select('status').eq('id', orderId).single(),
    ])
    if (containerRes.error) throw containerRes.error
    if (orderRes.error) throw orderRes.error

    const targetStatus = CONTAINER_TO_ORDER_STATUS[containerRes.data.status as ContainerStatus]
    const currentRank = ORDER_STATUS_RANK[orderRes.data.status] ?? 0
    const targetRank  = targetStatus ? (ORDER_STATUS_RANK[targetStatus] ?? 0) : 0

    const update: Record<string, unknown> = { container_id: containerId }
    if (targetStatus && targetRank > currentRank) {
      update.status = targetStatus
    }

    const { error } = await supabase.from('orders').update(update).eq('id', orderId)
    if (error) throw error
  },

  async unassignFromContainer(orderId: string): Promise<void> {
    // Fetch current status to decide if we need to reset it
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()
    if (fetchError) throw fetchError

    const update: Record<string, unknown> = { container_id: null }
    if (CONTAINER_MANAGED_STATUSES.has(order.status)) {
      update.status = 'pending'
    }

    const { error } = await supabase.from('orders').update(update).eq('id', orderId)
    if (error) throw error
  },

  /**
   * When a container's status changes, auto-advance all linked pre-orders
   * to the equivalent order status. Never moves an order backward.
   * Orders with only stock items (no container fulfillment_source) are skipped.
   * Returns the number of orders that were actually updated.
   */
  async syncOrdersToContainerStatus(
    containerId: string,
    containerStatus: ContainerStatus,
  ): Promise<number> {
    const targetOrderStatus = CONTAINER_TO_ORDER_STATUS[containerStatus]
    if (!targetOrderStatus) return 0 // cancelled — no sync

    // Fetch linked orders with their items to detect pre-order content
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, items:order_items!order_id(fulfillment_source)')
      .eq('container_id', containerId)
      .not('status', 'in', '(shipped,delivered,cancelled)')

    if (fetchError) throw fetchError
    if (!orders?.length) return 0

    const targetRank = ORDER_STATUS_RANK[targetOrderStatus]

    // Only update orders that:
    // 1. Have at least one pre-order item
    // 2. Are currently behind the target status
    const idsToUpdate = (orders as {
      id: string
      status: string
      items: { fulfillment_source: string | null }[]
    }[])
      .filter((o) => {
        const hasPreorderItem = o.items.some((i) => i.fulfillment_source === 'container')
        const currentRank = ORDER_STATUS_RANK[o.status] ?? 0
        return hasPreorderItem && currentRank < targetRank
      })
      .map((o) => o.id)

    if (!idsToUpdate.length) return 0

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: targetOrderStatus })
      .in('id', idsToUpdate)

    if (updateError) throw updateError
    return idsToUpdate.length
  },
}
