import { useNavigate } from 'react-router-dom'
import { Ship } from 'lucide-react'
import { useOrdersHistory } from '@/features/orders/hooks/useOrdersHistory'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge, FulfillmentTypeBadge, ContainerStatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useClientTable } from '@/hooks/useClientTable'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getOrderFulfillmentType } from '@/utils/orderFulfillmentType'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { OrderListItem, OrderStatus, ContainerStatus } from '@/types/database.types'
import type { OrderFulfillmentType } from '@/utils/orderFulfillmentType'
import type { SelectOption } from '@/types/common.types'
import type { Column } from '@/components/ui/DataTable'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing',
  'awaiting_container', 'in_transit', 'in_customs', 'in_warehouse', 'shipped',
]

const GROUP_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos los pedidos' },
  { value: 'active', label: 'Activos' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
]

const orderFilterFn = (order: OrderListItem, filters: Record<string, string>): boolean => {
  if (filters.group && filters.group !== 'all') {
    if (filters.group === 'active' && !ACTIVE_STATUSES.includes(order.status as OrderStatus)) return false
    if (filters.group === 'delivered' && order.status !== 'delivered') return false
    if (filters.group === 'cancelled' && order.status !== 'cancelled') return false
  }
  return true
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS: Column<OrderListItem>[] = [
  {
    key: 'order_number',
    header: 'Pedido',
    sortField: 'order_number',
    render: (order) => (
      <span className="font-medium text-white">#{order.order_number}</span>
    ),
  },
  {
    key: 'store_name',
    header: 'Tienda',
    sortField: 'store_name',
    render: (order) => (
      <span className="text-white/60 max-w-[140px] truncate block">{order.store_name}</span>
    ),
  },
  {
    key: 'fulfillment',
    header: 'Tipo',
    render: (order) => {
      const items = [
        ...(order.has_stock ? [{ fulfillment_source: 'stock' as const }] : []),
        ...(order.has_preorder ? [{ fulfillment_source: 'container' as const }] : []),
      ]
      return (
        <FulfillmentTypeBadge
          type={getOrderFulfillmentType(items) as OrderFulfillmentType}
        />
      )
    },
  },
  {
    key: 'container',
    header: 'Container',
    render: (order) => {
      if (!order.container) return <span className="text-white/20 text-xs">—</span>
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-info/10 border border-info/15">
            <Ship size={10} className="text-info/70 flex-shrink-0" />
            <span className="text-[11px] font-medium text-info/80">
              {order.container.container_number}
            </span>
          </div>
          <ContainerStatusBadge status={order.container.status as ContainerStatus} />
        </div>
      )
    },
  },
  {
    key: 'total_amount',
    header: 'Total',
    sortField: 'total_amount',
    render: (order) => (
      <span className="text-gold font-semibold">{formatCurrency(order.total_amount)}</span>
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
      <span className="text-white/40 text-xs">{formatDate(order.created_at)}</span>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders = [], isLoading, error, refetch } = useOrdersHistory()

  const table = useClientTable<OrderListItem>({
    data: orders,
    searchFields: ['order_number', 'store_name'],
    pageSize: 10,
    filterFn: orderFilterFn,
  })

  if (error) return <ErrorState onRetry={refetch} />

  const filterSlot = (
    <Select
      options={GROUP_OPTIONS}
      value={table.filters.group ?? 'all'}
      onChange={(e) => table.setFilter('group', e.target.value)}
      className="!h-9 !text-xs min-w-[170px]"
      aria-label="Filtrar pedidos"
    />
  )

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Mis Pedidos</h1>

      <DataTable<OrderListItem>
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
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
        filterSlot={filterSlot}
        getRowKey={(o) => o.id}
        searchPlaceholder="Buscar por #pedido o tienda..."
        emptyTitle="Sin pedidos"
        emptyDescription="No hay pedidos que coincidan con los filtros"
      />
    </div>
  )
}
