import { useState, useEffect, type FormEvent } from 'react'
import { ChevronDown, ChevronUp, Ship, Warehouse } from 'lucide-react'
import { useCartStore } from '@/features/cart/store/cartStore'
import { useAdmins } from '@/features/sellers/hooks/useSellers'
import { useCreateOrder } from '@/features/orders/hooks/useCreateOrder'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/formatCurrency'
import type { CartItemWithProduct } from '@/types/database.types'
import type { StoreInfo } from '@/features/orders/types/order.types'

// ─── Fulfillment badge ────────────────────────────────────────────────────────

function FulfillmentBadge({ item }: { item: CartItemWithProduct }) {
  if (item.fulfillment_source === 'container') {
    return (
      <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-info/70">
        <Ship size={9} />
        Pre-pedido
      </span>
    )
  }
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderReviewForm() {
  const items = useCartStore((s) => s.items)
  const { data: admins = [], isLoading: loadingAdmins } = useAdmins()
  const { mutate: createOrder, isPending } = useCreateOrder()

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    store_name: '',
    store_address: '',
    store_contact: '',
    notes: '',
  })
  const [adminId, setAdminId] = useState('')
  const [itemsExpanded, setItemsExpanded] = useState(false)

  useEffect(() => {
    if (admins.length > 0 && !adminId) {
      setAdminId(admins[0].id)
    }
  }, [admins])

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const adminOptions = admins.map((a) => ({ value: a.id, label: a.full_name }))
  const selectedAdmin = admins.find((a) => a.id === adminId)

  // Summary based on explicit fulfillment_source from cart
  const totalContainerUnits = items
    .filter((i) => i.fulfillment_source === 'container')
    .reduce((sum, i) => sum + i.quantity, 0)
  const totalStockUnits = items
    .filter((i) => i.fulfillment_source === 'stock')
    .reduce((sum, i) => sum + i.quantity, 0)
  const hasSplit = totalContainerUnits > 0

  const canSubmit = !!storeInfo.store_name && !!adminId

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    createOrder({ storeInfo, items, adminId })
  }

  const COLLAPSED_LIMIT = 3
  const visibleItems = itemsExpanded ? items : items.slice(0, COLLAPSED_LIMIT)
  const hasMore = items.length > COLLAPSED_LIMIT

  return (
    <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start">

      {/* ── Left: product list ── */}
      <Card>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-4">
          Productos ({itemCount} unidades · {items.length} referencias)
        </p>

        {/* Fulfillment summary banner */}
        {hasSplit && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-warning/5 border border-warning/15 flex flex-wrap gap-3 text-xs">
            {totalStockUnits > 0 && (
              <span className="flex items-center gap-1.5 text-success">
                <Warehouse size={11} />
                <span className="font-medium">{totalStockUnits}</span> desde stock
              </span>
            )}
            {totalContainerUnits > 0 && (
              <span className="flex items-center gap-1.5 text-info">
                <Ship size={11} />
                <span className="font-medium">{totalContainerUnits}</span> pre-pedido (sin stock actual)
              </span>
            )}
          </div>
        )}

        <ul className="divide-y divide-white/10 md:max-h-96 md:overflow-y-auto">
          {visibleItems.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
              <div className="min-w-0">
                <span className="text-white/80 truncate block">
                  {item.product.name}
                </span>
                {item.variant && (
                  <span className="text-[11px] text-white/40">{item.variant.label}</span>
                )}
                <span className="text-xs text-white/40 block">
                  {item.quantity} × {formatCurrency(item.product.price)}
                </span>
                <FulfillmentBadge item={item} />
              </div>
              <span className="text-white font-medium flex-shrink-0 text-right">
                {formatCurrency(item.quantity * item.product.price)}
              </span>
            </li>
          ))}
        </ul>

        {hasMore && (
          <button
            type="button"
            onClick={() => setItemsExpanded((v) => !v)}
            className="md:hidden flex items-center gap-1 mt-2 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {itemsExpanded ? (
              <><ChevronUp size={14} /> Mostrar menos</>
            ) : (
              <><ChevronDown size={14} /> Ver {items.length - COLLAPSED_LIMIT} más</>
            )}
          </button>
        )}

        <div className="flex justify-between pt-3 mt-3 border-t border-white/10">
          <span className="text-white/60 font-medium">Total</span>
          <span className="text-gold font-bold text-lg">{formatCurrency(subtotal)}</span>
        </div>
      </Card>

      {/* ── Right: form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 md:mt-0 md:sticky md:top-20">
        <Card>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-4">
            Información de la tienda
          </p>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre de la tienda *"
              value={storeInfo.store_name}
              onChange={(e) => setStoreInfo((s) => ({ ...s, store_name: e.target.value }))}
              placeholder="Tienda Ejemplo"
              required
            />
            <Input
              label="Dirección"
              value={storeInfo.store_address}
              onChange={(e) => setStoreInfo((s) => ({ ...s, store_address: e.target.value }))}
              placeholder="Calle 123, Ciudad"
            />
            <Input
              label="Contacto"
              value={storeInfo.store_contact}
              onChange={(e) => setStoreInfo((s) => ({ ...s, store_contact: e.target.value }))}
              placeholder="Teléfono o email"
            />
            <Input
              label="Notas"
              value={storeInfo.notes}
              onChange={(e) => setStoreInfo((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </div>
        </Card>

        <Card>
          {loadingAdmins ? (
            <div className="h-10 rounded-lg bg-white/5 animate-pulse" />
          ) : adminOptions.length > 0 ? (
            <Select
              label="Administrador *"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              options={adminOptions}
              placeholder="Seleccionar administrador..."
            />
          ) : (
            <p className="text-sm text-error/70">
              No hay administradores disponibles. Contactá al soporte.
            </p>
          )}
          {selectedAdmin?.phone && (
            <p className="mt-2 text-xs text-white/40 flex items-center gap-1">
              <span>📱</span>
              <span>WhatsApp: +{selectedAdmin.phone}</span>
            </p>
          )}
        </Card>

        {!storeInfo.store_name && (
          <p className="text-xs text-white/40 text-center">
            Completá el nombre de la tienda para continuar
          </p>
        )}

        <Button
          type="submit"
          isLoading={isPending}
          disabled={!canSubmit}
          size="lg"
        >
          Enviar pedido
        </Button>
      </form>
    </div>
  )
}
