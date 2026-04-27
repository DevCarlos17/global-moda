import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Ship, Calendar, Globe, FileText, Edit2, Plus, X } from 'lucide-react'
import { useContainerById } from '@/features/containers/hooks/useContainers'
import { useContainerOrders } from '@/features/containers/hooks/useContainerOrders'
import { useContainerStock } from '@/features/containers/hooks/useContainerStock'
import { ContainerFormModal } from '@/features/containers/components/ContainerFormModal'
import { ContainerPurchaseList } from '@/features/containers/components/ContainerPurchaseList'
import { ContainerStockTab } from '@/features/containers/components/ContainerStockTab'
import { AssignOrdersModal } from '@/features/containers/components/AssignOrdersModal'
import { ContainerStatusBadge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OrderDetailModal } from '@/features/admin/components/OrderDetailModal'
import { ErrorState } from '@/components/feedback/ErrorState'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { useUnassignOrderFromContainer } from '@/features/containers/hooks/useAssignOrders'
import type { ContainerStatus, OrderWithDetails, OrderStatus } from '@/types/database.types'

type Tab = 'stock' | 'purchase' | 'orders'

export function ContainerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: container, isLoading, error, refetch } = useContainerById(id)
  const { data: orders = [] } = useContainerOrders(id)
  const { data: stockItems = [] } = useContainerStock(id)

  const [activeTab, setActiveTab] = useState<Tab>('stock')
  const [editOpen, setEditOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)

  const { mutate: unassign, isPending: isUnassigning } = useUnassignOrderFromContainer(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !container) return <ErrorState onRetry={refetch} />

  return (
    <div className="flex flex-col gap-6">
      {/* Back nav */}
      <button
        onClick={() => navigate('/admin/containers')}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Containers
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Ship size={22} className="text-gold flex-shrink-0" />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-white">{container.container_number}</h1>
              <ContainerStatusBadge status={container.status as ContainerStatus} />
              {container.order_window_open && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success uppercase tracking-wide">
                  Ventana abierta
                </span>
              )}
            </div>
            <p className="text-sm text-white/40 mt-0.5">{container.supplier}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Edit2 size={13} />
          Editar
        </Button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <InfoCard icon={<Globe size={14} />} label="País de origen" value={container.origin_country} />
        <InfoCard
          icon={<Calendar size={14} />}
          label="Fecha de pedido"
          value={formatDate(container.order_date)}
        />
        <InfoCard
          icon={<Calendar size={14} />}
          label="ETD"
          value={container.etd ? formatDate(container.etd) : '—'}
        />
        <InfoCard
          icon={<Calendar size={14} />}
          label="ETA"
          value={container.eta ? formatDate(container.eta) : '—'}
        />
        {container.actual_arrival && (
          <InfoCard
            icon={<Calendar size={14} />}
            label="Llegada real"
            value={formatDate(container.actual_arrival)}
          />
        )}
        {container.order_deadline && (
          <InfoCard
            icon={<Calendar size={14} />}
            label="Cierre de ventana"
            value={formatDateTime(container.order_deadline)}
          />
        )}
        {container.notes && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <InfoCard icon={<FileText size={14} />} label="Notas" value={container.notes} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-white/10 mb-4">
          <TabButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')}>
            Compra propia{' '}
            {stockItems.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">
                {stockItems.length}
              </span>
            )}
          </TabButton>
          <TabButton active={activeTab === 'purchase'} onClick={() => setActiveTab('purchase')}>
            Lista de Compra
          </TabButton>
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            Pedidos incluidos{' '}
            {orders.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">
                {orders.length}
              </span>
            )}
          </TabButton>
        </div>

        {activeTab === 'stock' && (
          <ContainerStockTab
            containerId={container.id}
            containerStatus={container.status as ContainerStatus}
          />
        )}

        {activeTab === 'purchase' && <ContainerPurchaseList containerId={container.id} />}

        {activeTab === 'orders' && (
          <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/40">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} vinculado{orders.length !== 1 ? 's' : ''}
              </p>
              <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                <Plus size={13} />
                Agregar pedidos
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Ship size={32} className="text-white/15" />
                <p className="text-sm text-white/40">No hay pedidos vinculados a este container</p>
                <p className="text-xs text-white/25">
                  Usá el botón "Agregar pedidos" para vincular pre-pedidos existentes
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const preorderCount = order.items?.filter(
                  (i) => i.fulfillment_source === 'container',
                ).length ?? 0
                const preorderUnits = order.items
                  ?.filter((i) => i.fulfillment_source === 'container')
                  .reduce((s, i) => s + i.quantity, 0) ?? 0

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                  >
                    {/* Clickable info area */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">#{order.order_number}</p>
                        <StatusBadge status={order.status as OrderStatus} />
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {order.seller?.full_name ?? order.customer_name ?? '—'}
                      </p>
                      {preorderUnits > 0 && (
                        <p className="text-[11px] text-info/60 mt-1 flex items-center gap-1">
                          <Ship size={9} />
                          {preorderUnits} u. en {preorderCount} artículo{preorderCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </button>

                    {/* Amount + unassign */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-gold font-semibold text-sm">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <button
                        onClick={() => unassign(order.id)}
                        disabled={isUnassigning}
                        title="Quitar del container"
                        className="p-1.5 rounded-lg text-white/25 hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <ContainerFormModal
        container={container}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <AssignOrdersModal
        containerId={container.id}
        containerNumber={container.container_number}
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
      />

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-start gap-2.5">
      <span className="text-white/30 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-white text-white'
          : 'border-transparent text-white/40 hover:text-white/70'
      }`}
    >
      {children}
    </button>
  )
}
