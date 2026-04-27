import { useState } from 'react'
import { Download, Package, Users, Warehouse } from 'lucide-react'
import { useContainerAggregation } from '@/features/containers/hooks/useContainerAggregation'
import { Button } from '@/components/ui/Button'
import type { AggregatedItem } from '@/features/containers/services/containerAggregationService'

interface ContainerPurchaseListProps {
  containerId: string
}

function buildCsv(items: AggregatedItem[]): string {
  const header = 'SKU,Nombre,Variante,Vendedores,Stock Propio,Total,Ajustado'
  const rows = items.map((item) =>
    [
      item.product.sku,
      `"${item.product.name.replace(/"/g, '""')}"`,
      item.variant_label ? `"${item.variant_label}"` : '',
      item.seller_quantity,
      item.own_stock_quantity,
      item.total_quantity,
      item.adjusted_quantity ?? item.total_quantity,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ContainerPurchaseList({ containerId }: ContainerPurchaseListProps) {
  const { data: items = [], isLoading } = useContainerAggregation(containerId)
  const [adjustments, setAdjustments] = useState<Record<string, string>>({})

  function getAdjusted(productId: string, defaultQty: number): number {
    const val = adjustments[productId]
    if (val === undefined) return defaultQty
    const n = parseInt(val, 10)
    return isNaN(n) ? defaultQty : n
  }

  function handleExport() {
    const enriched: AggregatedItem[] = items.map((item) => ({
      ...item,
      adjusted_quantity: getAdjusted(item.key, item.total_quantity),
    }))
    downloadCsv(buildCsv(enriched), `lista-compra-${containerId}.csv`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Package size={32} className="text-white/20" />
        <p className="text-sm text-white/40">No hay productos en este container</p>
        <p className="text-xs text-white/25">
          Agregá pedidos de vendedores o registrá una compra propia
        </p>
      </div>
    )
  }

  const totalUnits = items.reduce((sum, i) => sum + getAdjusted(i.key, i.total_quantity), 0)
  const totalSeller = items.reduce((sum, i) => sum + i.seller_quantity, 0)
  const totalOwn = items.reduce((sum, i) => sum + i.own_stock_quantity, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <p className="text-sm text-white/50">
            <span className="text-white font-medium">{items.length}</span> productos ·{' '}
            <span className="text-white font-medium">{totalUnits}</span> unidades
          </p>
          {/* Desglose rápido */}
          {totalSeller > 0 && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Users size={11} />
              {totalSeller} vendedores
            </span>
          )}
          {totalOwn > 0 && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Warehouse size={11} />
              {totalOwn} stock propio
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download size={13} />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                Producto
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest whitespace-nowrap">
                <span className="flex items-center justify-end gap-1">
                  <Users size={10} />
                  Vendedores
                </span>
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest whitespace-nowrap">
                <span className="flex items-center justify-end gap-1">
                  <Warehouse size={10} />
                  Stock propio
                </span>
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                Total
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                Ajustado
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.key}
                className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
              >
                {/* Producto */}
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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] text-white/30">{item.product.sku}</p>
                        {item.variant_label && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-white/50 font-medium">
                            {item.variant_label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Vendedores */}
                <td className="px-4 py-3 text-right">
                  {item.seller_quantity > 0 ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 text-info text-xs font-semibold">
                      {item.seller_quantity}
                      {item.order_count > 0 && (
                        <span className="text-info/50 text-[10px]">({item.order_count}p)</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>

                {/* Stock propio */}
                <td className="px-4 py-3 text-right">
                  {item.own_stock_quantity > 0 ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                      {item.own_stock_quantity}
                    </div>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-right">
                  <span className="text-white font-bold">{item.total_quantity}</span>
                </td>

                {/* Ajustado */}
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min="0"
                    value={adjustments[item.key] ?? item.total_quantity}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="w-20 h-8 bg-white/5 border border-white/10 rounded-lg px-2 text-sm text-right text-white focus:outline-none focus:ring-1 focus:border-white/40 focus:ring-white/15"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
