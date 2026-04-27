import type { OrderWithDetails } from '@/types/database.types'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * Builds a wa.me deep link that opens WhatsApp with a pre-filled order message.
 * The seller reviews and taps Send — they stay in the chat with the admin.
 */
export function buildWhatsAppOrderUrl(order: OrderWithDetails): string {
  const adminNumber = order.admin?.phone ?? (import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER as string | undefined) ?? ''
  const message = buildOrderMessage(order)
  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`
}

export function buildOrderMessage(order: OrderWithDetails): string {
  const lines: string[] = [
    `🛍️ *Nuevo Pedido — Global Moda Imports*`,
    ``,
    `*Pedido:* ${order.order_number}`,
    `*Tienda:* ${order.store_name}`,
  ]

  if (order.store_address) lines.push(`*Dirección:* ${order.store_address}`)
  if (order.store_contact) lines.push(`*Contacto:* ${order.store_contact}`)

  lines.push(``, `*Productos:*`)

  for (const item of order.items) {
    lines.push(`  • ${item.product.name} × ${item.quantity} — ${formatCurrency(item.unit_price)}`)
  }

  lines.push(``, `*Total: ${formatCurrency(order.total_amount)}*`)

  if (order.notes) lines.push(``, `📝 ${order.notes}`)

  return lines.join('\n')
}
