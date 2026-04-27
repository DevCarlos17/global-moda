import { useState } from 'react'
import { Plus, Trash2, Ship, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/app/config/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import {
  useContainerStock,
  useUpsertContainerStockItem,
  useDeleteContainerStockItem,
} from '@/features/containers/hooks/useContainerStock'
import { ReceiveStockModal } from '@/features/containers/components/ReceiveStockModal'
import type { ContainerStatus } from '@/types/database.types'
import type { SelectOption } from '@/types/common.types'

interface SimpleProduct {
  id: string
  name: string
  sku: string
  product_variants: { id: string; label: string }[]
}

interface ContainerStockTabProps {
  containerId: string
  containerStatus: ContainerStatus
}

async function fetchAllActiveProducts(): Promise<SimpleProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, product_variants(id, label)')
    .eq('is_active', true)
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as SimpleProduct[]
}

function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all-simple'],
    queryFn: fetchAllActiveProducts,
  })
}

// ─── Inline Add Form ──────────────────────────────────────────────────────────

interface AddFormProps {
  containerId: string
  onCancel: () => void
}

function AddItemForm({ containerId, onCancel }: AddFormProps) {
  const { data: products = [] } = useAllProducts()
  const { mutate: upsert, isPending } = useUpsertContainerStockItem(containerId)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [qty, setQty] = useState(1)

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const hasVariants = (selectedProduct?.product_variants ?? []).length > 0

  const productOptions: SelectOption[] = [
    { value: '', label: 'Seleccionar producto...', disabled: true },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
  ]

  const variantOptions: SelectOption[] = [
    { value: '', label: 'Seleccionar variante...', disabled: true },
    ...(selectedProduct?.product_variants ?? []).map((v) => ({
      value: v.id,
      label: v.label,
    })),
  ]

  const handleProductChange = (id: string) => {
    setSelectedProductId(id)
    setSelectedVariantId('')
  }

  const handleSave = () => {
    if (!selectedProductId) return
    if (hasVariants && !selectedVariantId) return
    upsert(
      {
        productId: selectedProductId,
        variantId: hasVariants ? selectedVariantId : null,
        orderedQty: Math.max(1, qty),
      },
      { onSuccess: onCancel },
    )
  }

  const isValid = Boolean(selectedProductId) && (!hasVariants || Boolean(selectedVariantId))

  return (
    <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col gap-3">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
        Agregar producto
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* Product select */}
        <div className="lg:col-span-2">
          <Select
            options={productOptions}
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            aria-label="Seleccionar producto"
          />
        </div>

        {/* Variant select — only shown when product has variants */}
        {hasVariants ? (
          <div>
            <Select
              options={variantOptions}
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              aria-label="Seleccionar variante"
            />
          </div>
        ) : (
          <div /> /* spacer so qty column stays aligned */
        )}

        {/* Quantity */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="Cant."
            className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
            aria-label="Cantidad"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSave} isLoading={isPending} disabled={!isValid}>
          Guardar
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContainerStockTab({ containerId, containerStatus }: ContainerStockTabProps) {
  const { data: stockItems = [], isLoading } = useContainerStock(containerId)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteContainerStockItem(containerId)
  const [showAddForm, setShowAddForm] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const canReceive = containerStatus === 'arrived'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white">Compra propia</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Productos pedidos por el admin para stock propio, independientes de los pedidos de
            vendedores.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canReceive && stockItems.length > 0 && (
            <Button size="sm" onClick={() => setReceiveOpen(true)}>
              <Ship size={13} />
              Confirmar recepción
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm((prev) => !prev)}
            disabled={showAddForm}
          >
            <Plus size={13} />
            Agregar producto
          </Button>
        </div>
      </div>

      {/* Arrived notice */}
      {canReceive && stockItems.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-xl">
          <Ship size={14} className="text-success flex-shrink-0" />
          <p className="text-xs text-success">
            El container llegó. Confirmá la recepción para actualizar el stock en el inventario.
          </p>
        </div>
      )}

      {/* Inline add form */}
      {showAddForm && (
        <AddItemForm containerId={containerId} onCancel={() => setShowAddForm(false)} />
      )}

      {/* Items table */}
      {stockItems.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Package size={32} className="text-white/20" />
          <p className="text-sm text-white/40">Sin productos de compra propia</p>
          <p className="text-xs text-white/25">
            Usá el botón "Agregar producto" para incluir artículos en este container
          </p>
        </div>
      ) : stockItems.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                  Producto
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                  Variante
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                  Pedido
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                  Recibido
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="size-9 rounded-lg object-cover bg-white/5 flex-shrink-0"
                        />
                      ) : (
                        <div className="size-9 rounded-lg bg-white/5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{item.product.name}</p>
                        <p className="text-[10px] text-white/30">{item.product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {item.variant?.label ?? <span className="text-white/20">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-white/70 font-semibold">
                    {item.ordered_qty}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.received_qty != null ? (
                      <span className="text-success font-semibold">{item.received_qty}</span>
                    ) : (
                      <span className="text-white/20 text-xs">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={isDeleting}
                      title="Eliminar item"
                      className="p-1.5 rounded-lg text-white/25 hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Receive modal */}
      {receiveOpen && (
        <ReceiveStockModal
          isOpen={receiveOpen}
          onClose={() => setReceiveOpen(false)}
          containerId={containerId}
          items={stockItems}
        />
      )}
    </div>
  )
}
