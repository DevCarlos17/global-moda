import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Ship, Warehouse, Globe, Calendar } from 'lucide-react'
import { useOrderDetail } from '@/features/orders/hooks/useOrderDetail'
import { OrderVersionList } from '@/features/orders/components/OrderVersionList'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { ContainerStatusBadge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { Card } from '@/components/ui/Card'
import type { ContainerStatus } from '@/types/database.types'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading, error, refetch } = useOrderDetail(id!)

  if (isLoading) return <PageLoader />
  if (error || !order) return <ErrorState onRetry={refetch} />

  const container = order.container ?? null

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Volver a pedidos</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(order.created_at).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Store info */}
      <Card className="mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Tienda</p>
        <p className="font-medium text-gray-900">{order.store_name}</p>
        {order.store_address && (
          <p className="text-sm text-gray-500 mt-1">{order.store_address}</p>
        )}
        {order.notes && (
          <p className="text-sm text-gray-400 mt-2 italic">"{order.notes}"</p>
        )}
      </Card>

      {/* Items */}
      <Card className="mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Productos</p>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{item.product.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {item.quantity} × {formatCurrency(item.unit_price)}
                </p>
                {/* Fulfillment source badge */}
                {item.fulfillment_source === 'stock' && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-600">
                    <Warehouse size={9} />
                    En stock
                  </span>
                )}
                {item.fulfillment_source === 'container' && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-500">
                    <Ship size={9} />
                    Vía container
                  </span>
                )}
              </div>
              <span className="text-gray-900 font-medium flex-shrink-0">
                {formatCurrency(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
          <span className="text-gray-500 font-medium">Total</span>
          <span className="text-gray-900 font-bold text-lg">{formatCurrency(order.total_amount)}</span>
        </div>
      </Card>

      {/* Container info */}
      {container && (
        <Card className="mb-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Ship size={15} className="text-gray-400" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Importación</p>
            </div>
            <ContainerStatusBadge status={container.status as ContainerStatus} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Container</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{container.container_number}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Proveedor</p>
              <p className="text-sm text-gray-600 mt-0.5">{container.supplier}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={9} /> Origen
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{container.origin_country}</p>
            </div>
            {container.etd && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={9} /> Salida estimada
                </p>
                <p className="text-sm text-gray-600 mt-0.5">{formatDate(container.etd)}</p>
              </div>
            )}
            {container.eta && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={9} /> Llegada estimada
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(container.eta)}</p>
              </div>
            )}
            {container.actual_arrival && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Llegada real</p>
                <p className="text-sm text-green-600 font-medium mt-0.5">
                  {formatDate(container.actual_arrival)}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Version history */}
      <OrderVersionList orderId={id!} />
    </div>
  )
}
