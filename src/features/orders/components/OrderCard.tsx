import { Link } from 'react-router-dom'
import { ChevronRight, Ship } from 'lucide-react'
import { StatusBadge, ContainerStatusBadge, FulfillmentTypeBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getOrderFulfillmentType } from '@/utils/orderFulfillmentType'
import type { ContainerStatus, OrderListItem, OrderStatus } from '@/types/database.types'

interface OrderCardProps {
  order: OrderListItem
}

export function OrderCard({ order }: OrderCardProps) {
  const container = order.container
  const fulfillmentType = getOrderFulfillmentType(
    order.has_preorder && order.has_stock
      ? [{ fulfillment_source: 'stock' }, { fulfillment_source: 'container' }]
      : order.has_preorder
      ? [{ fulfillment_source: 'container' }]
      : [{ fulfillment_source: 'stock' }],
  )

  return (
    <Link
      to={`/orders/${order.id}`}
      className="flex items-center gap-4 p-4 bg-surface border border-white/10 rounded-2xl hover:border-white/20 transition-colors"
    >
      <div className="flex-1 min-w-0">
        {/* Top row: number + status + fulfillment type */}
        <div className="flex items-center gap-2.5 flex-wrap mb-1">
          <span className="font-semibold text-white text-sm">{order.order_number}</span>
          <StatusBadge status={order.status as OrderStatus} />
          <FulfillmentTypeBadge type={fulfillmentType} />
        </div>

        {/* Store + date */}
        <p className="text-sm text-white/50 truncate">{order.store_name}</p>
        <p className="text-xs text-white/30 mt-0.5">{formatDate(order.created_at)}</p>

        {/* Container row — only if assigned */}
        {container && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-info/10 border border-info/15">
              <Ship size={10} className="text-info/70 flex-shrink-0" />
              <span className="text-[11px] font-medium text-info/80">
                {container.container_number}
              </span>
            </div>
            <ContainerStatusBadge status={container.status as ContainerStatus} />
            {container.eta && (
              <span className="text-[11px] text-white/35">
                ETA {formatDate(container.eta)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-gold font-bold text-sm">{formatCurrency(order.total_amount)}</span>
        <ChevronRight size={16} className="text-white/30" />
      </div>
    </Link>
  )
}
