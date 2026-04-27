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
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Ver todos →
          </button>
        }
      />
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin pedidos aún</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
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
                    <span className="text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </span>
                    {order.order_type === 'customer' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wide">
                        Cliente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{name}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={order.status} className="text-[10px] px-1.5 py-0.5" />
                    <span className="text-[10px] text-gray-400">
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
