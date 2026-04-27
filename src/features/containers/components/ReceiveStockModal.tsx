import { useState, useEffect } from 'react'
import { Ship } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useReceiveContainerStock } from '@/features/containers/hooks/useContainerStock'
import type { ContainerStockItemWithProduct } from '@/types/database.types'

interface ReceiveStockModalProps {
  isOpen: boolean
  onClose: () => void
  containerId: string
  items: ContainerStockItemWithProduct[]
}

export function ReceiveStockModal({ isOpen, onClose, containerId, items }: ReceiveStockModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { mutate: receive, isPending } = useReceiveContainerStock()

  useEffect(() => {
    const initial: Record<string, number> = {}
    items.forEach((item) => {
      initial[item.id] = item.ordered_qty
    })
    setQuantities(initial)
  }, [items])

  const handleConfirm = () => {
    const payload = items.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      received_qty: quantities[item.id] ?? item.ordered_qty,
    }))
    receive({ containerId, items: payload }, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      noPadding
      className="max-h-[85vh] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 flex-shrink-0">
        <Ship size={16} className="text-info" />
        <h2 className="text-base font-semibold text-white">Confirmar recepción de mercancía</h2>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        <p className="text-xs text-white/40 mb-1">
          Ajustá las cantidades recibidas si hubo merma o faltante. El stock se actualizará al
          confirmar.
        </p>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl"
          >
            {item.product.images?.[0] ? (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="size-10 rounded-lg object-cover bg-white/5 flex-shrink-0"
              />
            ) : (
              <div className="size-10 rounded-lg bg-white/5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
              <p className="text-xs text-white/40">
                {item.product.sku}
                {item.variant ? ` · ${item.variant.label}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase tracking-wide">Pedido</p>
                <p className="text-sm text-white/50">{item.ordered_qty}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Recibido</p>
                <input
                  type="number"
                  min={0}
                  max={item.ordered_qty}
                  value={quantities[item.id] ?? item.ordered_qty}
                  onChange={(e) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [item.id]: Math.max(
                        0,
                        Math.min(item.ordered_qty, parseInt(e.target.value) || 0),
                      ),
                    }))
                  }
                  className="w-16 h-8 px-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white text-center focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} isLoading={isPending}>
          Confirmar recepción ({items.length} producto{items.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </Modal>
  )
}
