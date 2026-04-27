import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/features/orders/services/orderService'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { formatCurrency } from '@/utils/formatCurrency'

interface OrderVersionListProps {
  orderId: string
}

export function OrderVersionList({ orderId }: OrderVersionListProps) {
  const { data: versions } = useQuery({
    queryKey: ['orders', orderId, 'versions'],
    queryFn: () => orderService.getVersions(orderId),
    enabled: Boolean(orderId),
  })

  if (!versions || versions.length <= 1) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Historial de versiones</p>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />
        <ul className="flex flex-col gap-4">
          {versions.map((v) => (
            <li key={v.id} className="flex gap-4 items-start pl-2">
              {/* Dot */}
              <div className="size-2 rounded-full bg-gray-900 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900">{v.order_number}</span>
                  <OrderStatusBadge status={v.status} />
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(v.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' · '}
                  {formatCurrency(v.total_amount)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
