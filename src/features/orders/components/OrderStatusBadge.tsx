import { StatusBadge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/database.types'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return <StatusBadge status={status} className={className} />
}
