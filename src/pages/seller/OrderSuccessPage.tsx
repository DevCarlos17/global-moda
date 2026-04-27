import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/feedback/Loader'
import { useOrderDetail } from '@/features/orders/hooks/useOrderDetail'
import { buildWhatsAppOrderUrl, buildOrderMessage } from '@/services/whatsappService'

interface LocationState {
  orderId: string
  orderNumber: string
}

export function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const { data: order, isLoading } = useOrderDetail(state?.orderId ?? '')

  const adminPhone = order?.admin?.phone ?? null

  const handleWhatsApp = () => {
    if (!order) return
    const url = buildWhatsAppOrderUrl(order)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const messagePreview = order ? buildOrderMessage(order) : null

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col items-center">
      <div className="text-[#22c55e] mb-4 mt-8">
        <CheckCircle size={64} />
      </div>

      <h1 className="text-2xl font-semibold text-white mb-2 text-center">¡Pedido creado!</h1>

      {state?.orderNumber && (
        <>
          <p className="text-sm text-white/50 mb-1">Número de pedido</p>
          <p className="text-gold font-bold text-lg mb-4">{state.orderNumber}</p>
        </>
      )}

      {adminPhone ? (
        <p className="text-white/50 text-sm text-center mb-6">
          Revisá el mensaje y enviáselo al administrador por WhatsApp para confirmar el stock.
        </p>
      ) : (
        <p className="text-white/50 text-sm text-center mb-6">
          Tu pedido fue registrado. El administrador te contactará para confirmarlo.
        </p>
      )}

      {/* Message preview */}
      {adminPhone && (
        <div className="w-full mb-6">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">
            Vista previa del mensaje
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center h-24 rounded-xl border border-white/10 bg-white/5">
              <Loader size="sm" />
            </div>
          ) : messagePreview ? (
            <pre className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs text-white/70 leading-relaxed whitespace-pre-wrap break-words font-sans max-h-64 overflow-y-auto">
              {messagePreview}
            </pre>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        {adminPhone && (
          <Button
            size="lg"
            className="w-full bg-[#25d366] hover:bg-[#1ebe5d] active:bg-[#17a84d] text-white font-semibold border-0 shadow-lg shadow-[#25d366]/20"
            onClick={handleWhatsApp}
            disabled={isLoading || !order}
          >
            {isLoading ? <Loader size="sm" /> : <MessageCircle size={20} />}
            Enviar por WhatsApp
          </Button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/orders')}>
            Ver mis pedidos
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/catalog')}>
            Seguir comprando
          </Button>
        </div>
      </div>
    </div>
  )
}
