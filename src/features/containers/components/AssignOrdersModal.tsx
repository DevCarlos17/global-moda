import { useState } from 'react'
import { Ship, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { useUnassignedPreOrders } from '@/features/containers/hooks/useUnassignedOrders'
import { useAssignOrderToContainer } from '@/features/containers/hooks/useAssignOrders'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import type { OrderWithDetails, OrderStatus } from '@/types/database.types'

interface AssignOrdersModalProps {
  containerId: string
  containerNumber: string
  isOpen: boolean
  onClose: () => void
}

function OrderRow({
  order,
  selected,
  onToggle,
}: {
  order: OrderWithDetails
  selected: boolean
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const preorderItems = order.items?.filter((i) => i.fulfillment_source === 'container') ?? []
  const totalPreorderUnits = preorderItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div
      className={`rounded-xl border transition-colors ${
        selected
          ? 'border-gold/40 bg-gold/5'
          : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      {/* Main row */}
      <label className="flex items-start gap-3 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-0.5 accent-gold flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">#{order.order_number}</span>
            <StatusBadge status={order.status as OrderStatus} />
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            {order.seller?.full_name ?? '—'} · {formatDate(order.created_at)}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-info/70">
              <Ship size={10} />
              {totalPreorderUnits} u. pre-pedido en {preorderItems.length} artículo
              {preorderItems.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gold font-semibold">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setExpanded((v) => !v)
          }}
          className="p-1 text-white/30 hover:text-white transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </label>

      {/* Expanded product list */}
      {expanded && preorderItems.length > 0 && (
        <div className="px-4 pb-3 border-t border-white/[0.06] pt-3 flex flex-col gap-1.5">
          {preorderItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {item.product?.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="size-6 rounded object-cover bg-white/5 flex-shrink-0"
                  />
                ) : (
                  <div className="size-6 rounded bg-white/5 flex-shrink-0 flex items-center justify-center">
                    <Package size={10} className="text-white/20" />
                  </div>
                )}
                <span className="text-white/70 truncate">{item.product?.name}</span>
                <span className="text-white/30 flex-shrink-0">{item.product?.sku}</span>
              </div>
              <span className="text-white font-medium flex-shrink-0">× {item.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AssignOrdersModal({
  containerId,
  containerNumber,
  isOpen,
  onClose,
}: AssignOrdersModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data: orders = [], isLoading } = useUnassignedPreOrders()
  const { mutate: assign, isPending } = useAssignOrderToContainer(containerId)

  const toggleOrder = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map((o) => o.id)))
    }
  }

  const handleAssign = () => {
    if (selected.size === 0) return
    assign(Array.from(selected), {
      onSuccess: () => {
        setSelected(new Set())
        onClose()
      },
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar pedidos a ${containerNumber}`}
      description="Solo se muestran pedidos sin container asignado que tienen artículos de pre-pedido."
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Ship size={32} className="text-white/15" />
          <p className="text-sm text-white/40">No hay pedidos de pre-pedido sin asignar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Select all */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={selected.size === orders.length && orders.length > 0}
                onChange={toggleAll}
                className="accent-gold"
              />
              Seleccionar todos ({orders.length})
            </label>
            {selected.size > 0 && (
              <span className="text-xs text-gold font-medium">{selected.size} seleccionados</span>
            )}
          </div>

          {/* Order list */}
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                selected={selected.has(order.id)}
                onToggle={() => toggleOrder(order.id)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAssign}
              isLoading={isPending}
              disabled={selected.size === 0}
            >
              <Ship size={14} />
              Asignar {selected.size > 0 ? `${selected.size} pedido${selected.size !== 1 ? 's' : ''}` : 'pedidos'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
