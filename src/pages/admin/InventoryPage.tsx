import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useInventoryProducts } from '@/features/inventory/hooks/useInventory'
import { StockAdjustModal } from '@/features/inventory/components/StockAdjustModal'
import { DataTable } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import { useClientTable } from '@/hooks/useClientTable'
import { formatCurrency } from '@/utils/formatCurrency'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { InventoryProduct } from '@/types/database.types'
import type { SelectOption } from '@/types/common.types'
import type { Column } from '@/components/ui/DataTable'

// ─── Filter options ───────────────────────────────────────────────────────────

const STOCK_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos los stocks' },
  { value: 'in_stock', label: 'Con stock' },
  { value: 'low_stock', label: 'Stock bajo (≤5)' },
  { value: 'out_of_stock', label: 'Sin stock' },
]

const ACTIVE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

// ─── Filter function ──────────────────────────────────────────────────────────

const inventoryFilterFn = (
  product: InventoryProduct,
  filters: Record<string, string>,
): boolean => {
  if (filters.stock && filters.stock !== 'all') {
    if (filters.stock === 'in_stock' && product.stock_quantity <= 0) return false
    if (
      filters.stock === 'low_stock' &&
      (product.stock_quantity === 0 || product.stock_quantity > 5)
    )
      return false
    if (filters.stock === 'out_of_stock' && product.stock_quantity > 0) return false
  }
  if (filters.active && filters.active !== 'all') {
    if (filters.active === 'active' && !product.is_active) return false
    if (filters.active === 'inactive' && product.is_active) return false
  }
  return true
}

// ─── Stock badge helper ───────────────────────────────────────────────────────

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-error/15 text-error">
        Sin stock
      </span>
    )
  }
  if (qty <= 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-warning">
        {qty} u. — Bajo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">
      {qty} u.
    </span>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS: Column<InventoryProduct>[] = [
  {
    key: 'product',
    header: 'Producto',
    sortField: 'name',
    render: (p) => (
      <div className="flex items-center gap-3">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="size-9 rounded-lg object-cover bg-white/5 flex-shrink-0"
          />
        ) : (
          <div className="size-9 rounded-lg bg-white/5 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{p.name}</p>
          <p className="text-[10px] text-white/30">{p.sku}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Categoría',
    sortField: 'category_name',
    render: (p) => (
      <span className="text-white/50 text-xs">{p.category_name ?? <span className="text-white/20">—</span>}</span>
    ),
  },
  {
    key: 'variants',
    header: 'Variantes',
    render: (p) => (
      <span className="text-white/50 text-xs">
        {p.variants.length > 0 ? `${p.variants.length} variante${p.variants.length !== 1 ? 's' : ''}` : <span className="text-white/20">—</span>}
      </span>
    ),
  },
  {
    key: 'stock_quantity',
    header: 'Stock',
    sortField: 'stock_quantity',
    render: (p) => <StockBadge qty={p.stock_quantity} />,
  },
  {
    key: 'price',
    header: 'Precio',
    sortField: 'price',
    render: (p) => <span className="text-gold font-semibold">{formatCurrency(p.price)}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (p) =>
      p.is_active ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">
          Activo
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/40">
          Inactivo
        </span>
      ),
  },
  {
    key: 'actions',
    header: '',
    render: (p) => (
      <span className="text-xs text-white/30 hover:text-white/60 transition-colors">
        Ajustar stock →
      </span>
    ),
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InventoryPage() {
  const { data: products = [], isLoading, error, refetch } = useInventoryProducts()
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null)

  const table = useClientTable<InventoryProduct>({
    data: products,
    searchFields: ['name', 'sku'],
    pageSize: 15,
    filterFn: inventoryFilterFn,
  })

  if (error) return <ErrorState onRetry={refetch} />

  // Low stock banner: active products with stock_quantity between 1 and 5 (inclusive) OR 0
  const lowStockCount = products.filter((p) => p.is_active && p.stock_quantity <= 5).length

  const filterSlot = (
    <>
      <Select
        options={STOCK_OPTIONS}
        value={table.filters.stock ?? 'all'}
        onChange={(e) => table.setFilter('stock', e.target.value)}
        className="!h-9 !text-xs min-w-[160px]"
        aria-label="Filtrar por stock"
      />
      <Select
        options={ACTIVE_OPTIONS}
        value={table.filters.active ?? 'all'}
        onChange={(e) => table.setFilter('active', e.target.value)}
        className="!h-9 !text-xs min-w-[130px]"
        aria-label="Filtrar por estado"
      />
    </>
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Inventario</h1>

      {/* Low stock warning banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-warning/10 border border-warning/20 rounded-xl">
          <AlertTriangle size={16} className="text-warning flex-shrink-0" />
          <p className="text-sm text-warning">
            {lowStockCount} producto{lowStockCount !== 1 ? 's' : ''} con stock bajo o agotado.
            Revisá y ajustá el stock según corresponda.
          </p>
        </div>
      )}

      <DataTable<InventoryProduct>
        data={table.paginatedData}
        columns={COLUMNS}
        isLoading={isLoading}
        totalItems={table.totalItems}
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        startIndex={table.startIndex}
        endIndex={table.endIndex}
        onPageChange={table.setPage}
        searchQuery={table.searchQuery}
        onSearchChange={table.setSearchQuery}
        sortParams={table.sortParams}
        onSort={table.handleSort}
        onRowClick={setSelectedProduct}
        filterSlot={filterSlot}
        getRowKey={(p) => p.id}
        searchPlaceholder="Buscar por nombre o SKU..."
        emptyTitle="Sin productos"
        emptyDescription="No hay productos que coincidan con los filtros"
      />

      <StockAdjustModal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  )
}
