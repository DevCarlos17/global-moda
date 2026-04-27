export interface LineItem {
  quantity: number
  unit_price: number
}

export interface OrderTotals {
  subtotal: number
  itemCount: number
}

/**
 * Calculate totals from a list of line items.
 */
export function calculateTotals(items: LineItem[]): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { subtotal, itemCount }
}

/**
 * Calculate subtotal for a single line item.
 */
export function calculateLineSubtotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100
}
