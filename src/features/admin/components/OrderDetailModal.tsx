import { useState } from 'react'
import { X, Store, MapPin, Phone, FileText, User, Mail, Ship, Warehouse, Package } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge, ContainerStatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { OrderVersionList } from '@/features/orders/components/OrderVersionList'
import { useUpdateOrderStatus } from '@/features/admin/hooks/useUpdateOrderStatus'
import { useUpdateItemFulfillment } from '@/features/admin/hooks/useUpdateItemFulfillment'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { OrderWithDetails, OrderStatus, ContainerStatus, OrderItemWithProduct } from '@/types/database.types'
import type { SelectOption } from '@/types/common.types'

const STATUS_OPTIONS: SelectOption[] = [
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

interface OrderDetailModalProps {
  order: OrderWithDetails | null
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order?.status ?? 'pending',
  )
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const { mutate: updateFulfillment } = useUpdateItemFulfillment()

  if (!order) return null

  const handleStatusUpdate = () => {
    updateStatus({ id: order.id, status: selectedStatus })
  }

  const displayStatus = selectedStatus !== order.status ? selectedStatus : order.status

  const stockCount = (order.items ?? []).filter((i) => i.fulfillment_source === 'stock').length
  const containerCount = (order.items ?? []).filter((i) => i.fulfillment_source === 'container').length
  const unsetCount = (order.items ?? []).filter((i) => !i.fulfillment_source).length
  const hasMixed = stockCount > 0 && containerCount > 0

  return (
    <Modal
      isOpen={Boolean(order)}
      onClose={onClose}
      size="xl"
      noPadding
      className="max-h-[90vh] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">#{order.order_number}</h2>
          <StatusBadge status={order.status} />
          {order.order_type === 'customer' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wide">
              Cliente
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
              Vendedor
            </span>
          )}
          {hasMixed && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning/15 text-warning uppercase tracking-wide">
              Mixto
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6">
        {/* Order info */}
        <section>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Información del pedido
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={<FileText size={13} />} label="Fecha" value={formatDateTime(order.created_at)} />
            <InfoRow icon={<Store size={13} />} label="Tienda" value={order.store_name} />
            {order.store_address && (
              <InfoRow icon={<MapPin size={13} />} label="Dirección" value={order.store_address} />
            )}
            {order.store_contact && (
              <InfoRow icon={<Phone size={13} />} label="Contacto" value={order.store_contact} />
            )}
            {order.notes && (
              <div className="sm:col-span-2">
                <InfoRow icon={<FileText size={13} />} label="Notas" value={order.notes} />
              </div>
            )}
          </div>
        </section>

        {/* Seller / Customer info */}
        <section>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {order.order_type === 'seller' ? 'Vendedor' : 'Cliente'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {order.order_type === 'seller' && order.seller ? (
              <>
                <InfoRow icon={<User size={13} />} label="Nombre" value={order.seller.full_name} />
                <InfoRow icon={<Mail size={13} />} label="Email" value={order.seller.email} />
                {order.seller.phone && (
                  <InfoRow icon={<Phone size={13} />} label="Teléfono" value={order.seller.phone} />
                )}
              </>
            ) : order.order_type === 'customer' ? (
              <>
                {order.customer_name && (
                  <InfoRow icon={<User size={13} />} label="Nombre" value={order.customer_name} />
                )}
                {order.customer_email && (
                  <InfoRow icon={<Mail size={13} />} label="Email" value={order.customer_email} />
                )}
                {order.customer_phone && (
                  <InfoRow icon={<Phone size={13} />} label="Teléfono" value={order.customer_phone} />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Sin información de contacto</p>
            )}
          </div>
        </section>

        {/* Products + fulfillment source */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              Productos ({order.items?.length ?? 0})
            </p>
            {/* Summary pills */}
            {(stockCount > 0 || containerCount > 0) && (
              <div className="flex items-center gap-2">
                {stockCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-600">
                    <Warehouse size={10} />
                    {stockCount} en stock
                  </span>
                )}
                {containerCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-500">
                    <Ship size={10} />
                    {containerCount} container
                  </span>
                )}
                {unsetCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                    <Package size={10} />
                    {unsetCount} sin definir
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {(order.items ?? []).map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                orderId={order.id}
                onUpdate={updateFulfillment}
              />
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </section>

        {/* Container info */}
        {order.container && (
          <section>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Container asociado
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Ship size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {order.container.container_number}
                  </span>
                </div>
                <ContainerStatusBadge status={order.container.status as ContainerStatus} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 uppercase tracking-wider text-[10px]">Proveedor</p>
                  <p className="text-gray-600 mt-0.5">{order.container.supplier}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider text-[10px]">Origen</p>
                  <p className="text-gray-600 mt-0.5">{order.container.origin_country}</p>
                </div>
                {order.container.eta && (
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider text-[10px]">ETA</p>
                    <p className="text-gray-600 mt-0.5">{formatDate(order.container.eta)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Version history */}
        <OrderVersionList orderId={order.id} />
      </div>

      {/* Sticky footer — always visible regardless of scroll position */}
      {order.container && containerCount > 0 ? (
        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex items-center gap-3">
          <Ship size={13} className="text-blue-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 flex-1">
            Estado gestionado automáticamente por el container{' '}
            <span className="text-blue-500 font-medium">{order.container.container_number}</span>
          </p>
          <StatusBadge status={order.status} />
        </div>
      ) : (
        <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex items-center gap-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0">
            Estado
          </p>
          <div className="flex-1">
            <Select
              options={STATUS_OPTIONS}
              value={displayStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            />
          </div>
          <Button
            onClick={handleStatusUpdate}
            isLoading={isPending}
            disabled={selectedStatus === order.status}
            size="md"
          >
            Actualizar
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemRow({
  item,
  orderId,
  onUpdate,
}: {
  item: OrderItemWithProduct
  orderId: string
  onUpdate: (params: { itemId: string; source: 'stock' | 'container' | null; orderId: string }) => void
}) {
  const source = item.fulfillment_source

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
      {item.product.images?.[0] ? (
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="size-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
        />
      ) : (
        <div className="size-12 rounded-lg bg-gray-100 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
        <p className="text-xs text-gray-400">
          {item.quantity} × {formatCurrency(item.unit_price)}
        </p>
      </div>

      {/* Fulfillment source selector */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <SourceButton
          active={source === 'stock'}
          icon={<Warehouse size={11} />}
          label="Stock"
          activeClass="bg-success/15 text-success border-success/30"
          onClick={() =>
            onUpdate({ itemId: item.id, source: source === 'stock' ? null : 'stock', orderId })
          }
        />
        <SourceButton
          active={source === 'container'}
          icon={<Ship size={11} />}
          label="Container"
          activeClass="bg-info/15 text-info border-info/30"
          onClick={() =>
            onUpdate({ itemId: item.id, source: source === 'container' ? null : 'container', orderId })
          }
        />
      </div>

      <span className="text-sm font-semibold text-gray-900 flex-shrink-0 w-20 text-right">
        {formatCurrency(item.subtotal)}
      </span>
    </div>
  )
}

function SourceButton({
  active,
  icon,
  label,
  activeClass,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  activeClass: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 h-6 rounded-md border text-[10px] font-semibold transition-colors',
        active
          ? activeClass
          : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}
