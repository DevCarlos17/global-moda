export type OrderFulfillmentType = 'stock' | 'preorder' | 'mixed'

/**
 * Computes the fulfillment type of an order from its items.
 * - 'stock'   — all items come from current inventory
 * - 'preorder'— all items are container/pre-order
 * - 'mixed'   — both stock and pre-order items in the same order
 */
export function getOrderFulfillmentType(
  items: { fulfillment_source: string | null }[],
): OrderFulfillmentType {
  const hasStock = items.some((i) => i.fulfillment_source === 'stock')
  const hasPreorder = items.some((i) => i.fulfillment_source === 'container')
  if (hasStock && hasPreorder) return 'mixed'
  if (hasPreorder) return 'preorder'
  return 'stock'
}
