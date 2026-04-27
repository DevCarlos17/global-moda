import { CalendarClock, X } from 'lucide-react'
import { useState } from 'react'
import { useOpenWindow } from '@/features/containers/hooks/useContainers'
import { formatDateTime } from '@/utils/formatDate'

export function OrderWindowBanner() {
  const { data: container } = useOpenWindow()
  const [dismissed, setDismissed] = useState(false)

  if (!container || dismissed) return null

  const deadlineText = container.order_deadline
    ? `hasta el ${formatDateTime(container.order_deadline)}`
    : 'sin fecha límite definida'

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-success/10 border-b border-success/20 text-sm">
      <CalendarClock size={15} className="text-success flex-shrink-0" />
      <p className="flex-1 text-white/80">
        <span className="font-semibold text-success">Ventana de pedidos abierta</span>
        {' — '}
        Tus pedidos serán incluidos en el container{' '}
        <span className="text-white font-medium">{container.container_number}</span>{' '}
        ({deadlineText})
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-white/30 hover:text-white transition-colors flex-shrink-0"
        aria-label="Cerrar aviso"
      >
        <X size={14} />
      </button>
    </div>
  )
}
