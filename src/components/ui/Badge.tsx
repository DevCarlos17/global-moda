import type { ReactNode } from 'react'
import { Ship, Warehouse, Shuffle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { OrderStatus, ContainerStatus } from '@/types/database.types'
import type { OrderFulfillmentType } from '@/utils/orderFulfillmentType'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/70',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
  gold: 'bg-gold/15 text-gold',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

const statusVariantMap: Record<OrderStatus, BadgeVariant> = {
  draft: 'default',
  pending: 'warning',
  confirmed: 'info',
  processing: 'gold',
  awaiting_container: 'info',
  in_transit: 'gold',
  in_customs: 'warning',
  in_warehouse: 'gold',
  shipped: 'gold',
  delivered: 'success',
  cancelled: 'error',
}

const statusLabelMap: Record<OrderStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En proceso',
  awaiting_container: 'Esperando container',
  in_transit: 'En tránsito',
  in_customs: 'En aduana',
  in_warehouse: 'En depósito',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]} className={className}>
      {statusLabelMap[status]}
    </Badge>
  )
}

const containerStatusVariantMap: Record<ContainerStatus, BadgeVariant> = {
  draft: 'default',
  ordered: 'info',
  in_transit: 'gold',
  in_customs: 'warning',
  arrived: 'success',
  cancelled: 'error',
}

const containerStatusLabelMap: Record<ContainerStatus, string> = {
  draft: 'Borrador',
  ordered: 'Pedido',
  in_transit: 'En tránsito',
  in_customs: 'En aduana',
  arrived: 'Llegado',
  cancelled: 'Cancelado',
}

interface ContainerStatusBadgeProps {
  status: ContainerStatus
  className?: string
}

export function ContainerStatusBadge({ status, className }: ContainerStatusBadgeProps) {
  return (
    <Badge variant={containerStatusVariantMap[status]} className={className}>
      {containerStatusLabelMap[status]}
    </Badge>
  )
}

// ─── Fulfillment type badge ────────────────────────────────────────────────────

const fulfillmentVariantMap: Record<OrderFulfillmentType, BadgeVariant> = {
  stock:    'default',
  preorder: 'info',
  mixed:    'warning',
}

const fulfillmentIconMap: Record<OrderFulfillmentType, ReactNode> = {
  stock:    <Warehouse size={10} />,
  preorder: <Ship size={10} />,
  mixed:    <Shuffle size={10} />,
}

const fulfillmentLabelMap: Record<OrderFulfillmentType, string> = {
  stock:    'Pedido',
  preorder: 'Pre-pedido',
  mixed:    'Mixto',
}

interface FulfillmentTypeBadgeProps {
  type: OrderFulfillmentType
  className?: string
}

export function FulfillmentTypeBadge({ type, className }: FulfillmentTypeBadgeProps) {
  return (
    <Badge variant={fulfillmentVariantMap[type]} className={className}>
      {fulfillmentIconMap[type]}
      {fulfillmentLabelMap[type]}
    </Badge>
  )
}
