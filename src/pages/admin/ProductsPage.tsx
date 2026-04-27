import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, SlidersHorizontal, AlertTriangle } from 'lucide-react'
import { useAllProducts } from '@/features/catalog/hooks/useProducts'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'
import { ProductPreviewModal } from '@/features/admin/components/ProductPreviewModal'
import { StockAdjustModal } from '@/features/inventory/components/StockAdjustModal'
import { DeleteProductModal } from '@/features/admin/components/DeleteProductModal'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useClientTable } from '@/hooks/useClientTable'
import { formatCurrency } from '@/utils/formatCurrency'
import { ErrorState } from '@/components/feedback/ErrorState'
import { cn } from '@/utils/cn'
import type { ProductWithCategory, CategoryWithChildren } from '@/types/database.types'
import type { SelectOption } from '@/types/common.types'
import type { Column } from '@/components/ui/DataTable'
import type { StockAdjustTarget } from '@/features/inventory/components/StockAdjustModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenCategoryTree(cats: CategoryWithChildren[], depth = 0): SelectOption[] {
  return cats.flatMap((cat) => [
    { value: cat.id, label: `${'— '.repeat(depth)}${cat.name}` },
    ...flattenCategoryTree(cat.children, depth + 1),
  ])
}

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

const STOCK_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todo el stock' },
  { value: 'in', label: 'Con stock' },
  { value: 'low', label: 'Stock bajo (≤5)' },
  { value: 'out', label: 'Sin stock' },
]

const productFilterFn = (product: ProductWithCategory, filters: Record<string, string>): boolean => {
  if (filters.category && filters.category !== 'all' && product.category_id !== filters.category)
    return false
  if (filters.status === 'active' && !product.is_active) return false
  if (filters.status === 'inactive' && product.is_active) return false
  if (filters.stock === 'in' && product.stock_quantity <= 0) return false
  if (filters.stock === 'low' && (product.stock_quantity === 0 || product.stock_quantity > 5)) return false
  if (filters.stock === 'out' && product.stock_quantity > 0) return false
  return true
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockCell({ qty }: { qty: number }) {
  return (
    <span
      className={cn(
        'text-sm font-semibold tabular-nums',
        qty === 0 ? 'text-error' : qty <= 5 ? 'text-warning' : 'text-success',
      )}
    >
      {qty}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductsPage() {
  const navigate = useNavigate()
  const { data: products = [], isLoading, error, refetch } = useAllProducts()
  const { data: categoryTree = [] } = useCategoryTree()
  const [previewProduct, setPreviewProduct] = useState<ProductWithCategory | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<StockAdjustTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const table = useClientTable<ProductWithCategory>({
    data: products,
    searchFields: ['name', 'sku'],
    pageSize: 10,
    filterFn: productFilterFn,
  })

  const categoryOptions: SelectOption[] = [
    { value: 'all', label: 'Todas las categorías' },
    ...flattenCategoryTree(categoryTree),
  ]

  const lowStockCount = products.filter((p) => p.is_active && p.stock_quantity <= 5).length

  const handleDelete = (e: React.MouseEvent, product: ProductWithCategory) => {
    e.stopPropagation()
    setDeleteTarget({ id: product.id, name: product.name })
  }

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    navigate(`/admin/products/${id}/edit`)
  }

  const handleAdjustStock = (e: React.MouseEvent, product: ProductWithCategory) => {
    e.stopPropagation()
    setAdjustTarget({ id: product.id, name: product.name, sku: product.sku, stock_quantity: product.stock_quantity })
  }

  const columns: Column<ProductWithCategory>[] = [
    {
      key: 'name',
      header: 'Producto',
      sortField: 'name',
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="size-9 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
          ) : (
            <div className="size-9 rounded-lg bg-gray-100 flex-shrink-0" />
          )}
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      sortField: 'sku',
      render: (product) => (
        <span className="text-gray-400 font-mono text-xs">{product.sku}</span>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (product) => (
        <span className="text-gray-500">{product.category?.name ?? '—'}</span>
      ),
    },
    {
      key: 'price',
      header: 'Precio',
      sortField: 'price',
      render: (product) => (
        <span className="text-gray-900 font-semibold">{formatCurrency(product.price)}</span>
      ),
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      sortField: 'stock_quantity',
      render: (product) => <StockCell qty={product.stock_quantity} />,
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (product) =>
        product.is_active ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="error">Inactivo</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => handleAdjustStock(e, product)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
            aria-label="Ajustar stock"
            title="Ajustar stock"
          >
            <SlidersHorizontal size={14} />
          </button>
          <button
            onClick={(e) => handleEdit(e, product.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => handleDelete(e, product)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  if (error) return <ErrorState onRetry={refetch} />

  const filterSlot = (
    <>
      <Select
        options={categoryOptions}
        value={table.filters.category ?? 'all'}
        onChange={(e) => table.setFilter('category', e.target.value)}
        className="!h-9 !text-xs min-w-[180px]"
        aria-label="Filtrar por categoría"
      />
      <Select
        options={STATUS_OPTIONS}
        value={table.filters.status ?? 'all'}
        onChange={(e) => table.setFilter('status', e.target.value)}
        className="!h-9 !text-xs min-w-[140px]"
        aria-label="Filtrar por estado"
      />
      <Select
        options={STOCK_OPTIONS}
        value={table.filters.stock ?? 'all'}
        onChange={(e) => table.setFilter('stock', e.target.value)}
        className="!h-9 !text-xs min-w-[150px]"
        aria-label="Filtrar por stock"
      />
    </>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
        <Button onClick={() => navigate('/admin/products/new')} size="sm">
          <Plus size={16} />
          Nuevo producto
        </Button>
      </div>

      {/* Banner de stock bajo */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-warning/10 border border-warning/20 rounded-xl text-sm text-warning">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>
            <span className="font-semibold">{lowStockCount}</span>{' '}
            producto{lowStockCount !== 1 ? 's' : ''} con stock bajo o agotado
          </span>
          <button
            onClick={() => table.setFilter('stock', 'low')}
            className="ml-auto text-xs underline underline-offset-2 hover:text-warning/70 transition-colors"
          >
            Ver solo esos
          </button>
        </div>
      )}

      <DataTable<ProductWithCategory>
        data={table.paginatedData}
        columns={columns}
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
        onRowClick={setPreviewProduct}
        filterSlot={filterSlot}
        getRowKey={(p) => p.id}
        searchPlaceholder="Buscar por nombre o SKU..."
        emptyTitle="Sin productos"
        emptyDescription="No hay productos que coincidan con los filtros"
      />

      <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} />

      <StockAdjustModal
        isOpen={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        product={adjustTarget}
      />

      <DeleteProductModal product={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
