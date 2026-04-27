import { useState } from 'react'
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders'
import { OrderDetailModal } from '@/features/admin/components/OrderDetailModal'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, FulfillmentTypeBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useClientTable } from '@/hooks/useClientTable'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getOrderFulfillmentType } from '@/utils/orderFulfillmentType'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { OrderWithDetails, OrderStatus } from '@/types/database.types'
import type { OrderFulfillmentType } from '@/utils/orderFulfillmentType'
import type { SelectOption } from '@/types/common.types'
import type { Column } from '@/components/ui/DataTable'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'En proceso' },
  { value: 'awaiting_container', label: 'Esperando container' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'in_customs', label: 'En aduana' },
  { value: 'in_warehouse', label: 'En depósito' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const ORDER_TYPE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'customer', label: 'Cliente' },
]

const FULFILLMENT_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'stock', label: 'Pedido' },
  { value: 'preorder', label: 'Pre-pedido' },
  { value: 'mixed', label: 'Mixto' },
]

const orderFilterFn = (order: OrderWithDetails, filters: Record<string, string>): boolean => {
  if (filters.status && filters.status !== 'all' && order.status !== filters.status) return false
  if (filters.order_type && filters.order_type !== 'all' && order.order_type !== filters.order_type) return false
  if (filters.fulfillment && filters.fulfillment !== 'all') {
    const type = getOrderFulfillmentType(order.items ?? [])
    if (type !== filters.fulfillment) return false
  }
  return true
}

const COLUMNS: Column<OrderWithDetails>[] = [
  {
    key: 'order_number',
    header: 'Pedido',
    sortField: 'order_number',
    render: (order) => (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-gray-900">#{order.order_number}</span>
        {order.order_type === 'customer' && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wide">
            Cliente
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'person',
    header: 'Vendedor / Cliente',
    render: (order) => (
      <span className="text-gray-500">
        {order.order_type === 'customer'
          ? (order.customer_name ?? '—')
          : (order.seller?.full_name ?? '—')}
      </span>
    ),
  },
  {
    key: 'store_name',
    header: 'Tienda',
    sortField: 'store_name',
    render: (order) => (
      <span className="text-gray-500 max-w-[140px] truncate block">{order.store_name}</span>
    ),
  },
  {
    key: 'fulfillment',
    header: 'Tipo',
    render: (order) => (
      <FulfillmentTypeBadge
        type={getOrderFulfillmentType(order.items ?? []) as OrderFulfillmentType}
      />
    ),
  },
  {
    key: 'total_amount',
    header: 'Total',
    sortField: 'total_amount',
    render: (order) => (
      <span className="text-gray-900 font-semibold">{formatCurrency(order.total_amount)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (order) => <StatusBadge status={order.status as OrderStatus} />,
  },
  {
    key: 'created_at',
    header: 'Fecha',
    sortField: 'created_at',
    render: (order) => (
      <span className="text-gray-400 text-xs">{formatDate(order.created_at)}</span>
    ),
  },
]

export function AdminOrdersPage() {
  const { data: orders = [], isLoading, error, refetch } = useAdminOrders()
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)

  const table = useClientTable<OrderWithDetails>({
    data: orders,
    searchFields: ['order_number', 'store_name'],
    pageSize: 10,
    filterFn: orderFilterFn,
  })

  if (error) return <ErrorState onRetry={refetch} />

  const filterSlot = (
    <>
      <Select
        options={STATUS_OPTIONS}
        value={table.filters.status ?? 'all'}
        onChange={(e) => table.setFilter('status', e.target.value)}
        className="!h-9 !text-xs min-w-[160px]"
        aria-label="Filtrar por estado"
      />
      <Select
        options={FULFILLMENT_OPTIONS}
        value={table.filters.fulfillment ?? 'all'}
        onChange={(e) => table.setFilter('fulfillment', e.target.value)}
        className="!h-9 !text-xs min-w-[150px]"
        aria-label="Filtrar por tipo de cumplimiento"
      />
      <Select
        options={ORDER_TYPE_OPTIONS}
        value={table.filters.order_type ?? 'all'}
        onChange={(e) => table.setFilter('order_type', e.target.value)}
        className="!h-9 !text-xs min-w-[150px]"
        aria-label="Filtrar por origen del pedido"
      />
    </>
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pedidos</h1>

      <DataTable<OrderWithDetails>
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
        onRowClick={setSelectedOrder}
        filterSlot={filterSlot}
        getRowKey={(o) => o.id}
        searchPlaceholder="Buscar por #pedido o tienda..."
        emptyTitle="Sin pedidos"
        emptyDescription="No hay pedidos que coincidan con los filtros"
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
