import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatRelative } from '@/utils/formatDate'
import type { RecentOrder } from '@/types/database.types'

interface RecentOrdersListProps {
  orders: RecentOrder[]
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader
        title="Pedidos recientes"
        description="Últimos 5 pedidos"
        action={
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs text-gold hover:text-gold/80 transition-colors"
          >
            Ver todos →
          </button>
        }
      />
      {orders.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-4">Sin pedidos aún</p>
      ) : (
        <div className="flex flex-col divide-y divide-white/[0.06]">
          {orders.map((order) => {
            const name =
              order.order_type === 'customer'
                ? (order.customer_name ?? '—')
                : (order.seller_name ?? '—')

            return (
              <div
                key={order.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white">
                      #{order.order_number}
                    </span>
                    {order.order_type === 'customer' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-info/15 text-info uppercase tracking-wide">
                        Cliente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate">{name}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-semibold text-gold">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={order.status} className="text-[10px] px-1.5 py-0.5" />
                    <span className="text-[10px] text-white/25">
                      {formatRelative(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
