import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'
import type { CustomerOrderPayload } from '@/features/orders/types/order.types'

interface LocationState {
  orderId: string
  payload: CustomerOrderPayload
}

export function PublicOrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const adminNumber = import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER as string | undefined

  const handleWhatsApp = () => {
    if (!state || !adminNumber) return
    const message = buildCustomerMessage(state.payload)
    const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <div className="text-[#22c55e] mb-4">
        <CheckCircle size={64} />
      </div>

      <h1 className="text-2xl font-semibold text-white mb-2">¡Pedido registrado!</h1>

      {state?.payload.customerName && (
        <p className="text-white/50 text-sm mb-1">
          Gracias, <span className="text-white">{state.payload.customerName}</span>
        </p>
      )}

      <p className="text-white/40 text-sm max-w-xs mb-8 mt-2">
        {adminNumber
          ? 'Enviá tu pedido por WhatsApp para que podamos confirmar disponibilidad y coordinar la entrega.'
          : 'Tu pedido fue registrado. Nos pondremos en contacto contigo pronto.'}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {adminNumber && state && (
          <Button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1ebe5d] text-white border-0 w-full"
          >
            <MessageCircle size={18} />
            Enviar pedido por WhatsApp
          </Button>
        )}

        <Button variant="outline" onClick={() => navigate('/public/catalog')}>
          Seguir comprando
        </Button>
      </div>
    </div>
  )
}

function buildCustomerMessage(payload: CustomerOrderPayload): string {
  const lines = [
    `🛍️ *Nuevo Pedido — Global Moda Imports*`,
    ``,
    `*Cliente:* ${payload.customerName}`,
    `*WhatsApp:* ${payload.customerPhone}`,
  ]

  if (payload.customerEmail) lines.push(`*Email:* ${payload.customerEmail}`)
  if (payload.address) lines.push(`*Dirección:* ${payload.address}`)

  lines.push(``, `*Productos:*`)

  for (const item of payload.items) {
    lines.push(`  • ${item.name} × ${item.quantity} — ${formatCurrency(item.unit_price)}`)
  }

  lines.push(``, `*Total: ${formatCurrency(payload.totalAmount)}*`)

  if (payload.notes) lines.push(``, `📝 ${payload.notes}`)

  return lines.join('\n')
}
