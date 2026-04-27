import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, Pencil, X, Check } from 'lucide-react'
import { useSellerOrders } from '@/features/admin/hooks/useSellerOrders'
import { useAllUsers, useUpdateUser } from '@/features/sellers/hooks/useSellers'
import { useOrderDetail } from '@/features/orders/hooks/useOrderDetail'
import { OrderDetailModal } from '@/features/admin/components/OrderDetailModal'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageLoader } from '@/components/feedback/Loader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import type { OrderWithDetails } from '@/types/database.types'

const roleOptions = [
  { value: 'seller', label: 'Vendedor' },
  { value: 'admin', label: 'Administrador' },
]

function OrderDetailLoader({
  orderId,
  onClose,
}: {
  orderId: string
  onClose: () => void
}) {
  const { data: order = null } = useOrderDetail(orderId)
  return <OrderDetailModal order={order as OrderWithDetails | null} onClose={onClose} />
}

export function SellerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: 'seller' as 'seller' | 'admin' })

  const { data: allUsers = [], isLoading: loadingUser } = useAllUsers()
  const {
    data: orders = [],
    isLoading: loadingOrders,
    error,
    refetch,
  } = useSellerOrders(id!)
  const { mutate: updateUser, isPending: isSaving } = useUpdateUser()

  const user = allUsers.find((u) => u.id === id)

  const startEditing = () => {
    if (!user) return
    setEditForm({ full_name: user.full_name, phone: user.phone ?? '', role: user.role })
    setEditing(true)
  }

  const handleSave = () => {
    if (!id) return
    updateUser(
      {
        id,
        updates: {
          full_name: editForm.full_name,
          phone: editForm.phone,
          role: editForm.role,
        },
      },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (loadingUser || loadingOrders) return <PageLoader />
  if (error) return <ErrorState onRetry={refetch} />
  if (!user) return <ErrorState title="Usuario no encontrado" onRetry={() => navigate('/admin/sellers')} />

  return (
    <div>
      <button
        onClick={() => navigate('/admin/sellers')}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Volver a usuarios</span>
      </button>

      {/* Profile header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="size-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white/60">
            {user.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            /* ── Edit form ── */
            <div className="flex flex-col gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Nombre completo"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                />
                <Input
                  label="WhatsApp"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Ej: 584141641502 (sin +)"
                />
              </div>
              <div className="sm:w-48">
                <Select
                  label="Rol"
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as 'seller' | 'admin' }))}
                  options={roleOptions}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                  <Check size={14} />
                  Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={isSaving}>
                  <X size={14} />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            /* ── Profile view ── */
            <>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-xl font-semibold text-white">{user.full_name}</h1>
                <Badge variant={user.role === 'admin' ? 'gold' : 'info'}>
                  {user.role === 'admin' ? 'Admin' : 'Vendedor'}
                </Badge>
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
                >
                  <Pencil size={12} />
                  Editar
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="flex items-center gap-1.5 text-white/40 text-sm">
                  <Mail size={13} />
                  {user.email}
                </span>
                {user.phone ? (
                  <span className="flex items-center gap-1.5 text-white/40 text-sm">
                    <Phone size={13} />
                    +{user.phone}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-error/60 text-sm">
                    <Phone size={13} />
                    Sin teléfono
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-white/40 text-sm">
                  <Calendar size={13} />
                  Desde {formatDate(user.created_at)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Orders section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
          Historial de pedidos
        </h2>
        <span className="text-xs text-white/30">{orders.length} pedidos</span>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Sin pedidos"
          description="Este usuario aún no tiene pedidos registrados"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className="w-full flex items-center justify-between gap-4 p-4 bg-surface border border-white/10 rounded-xl hover:border-white/25 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-semibold text-white text-sm">
                    {order.order_number}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-white/50 truncate">{order.store_name}</p>
                <p className="text-xs text-white/30 mt-0.5">{formatDate(order.created_at)}</p>
              </div>
              <span className="text-gold font-bold flex-shrink-0 text-sm">
                {formatCurrency(order.total_amount)}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailLoader
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  )
}
