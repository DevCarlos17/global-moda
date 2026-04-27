import { useState, type FormEvent } from 'react'
import { useCartStore } from '@/features/cart/store/cartStore'
import { useAdmins } from '@/features/sellers/hooks/useSellers'
import { useUpdateOrder } from '@/features/orders/hooks/useUpdateOrder'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { StoreInfo } from '@/features/orders/types/order.types'
import type { Order } from '@/types/database.types'

interface EditOrderFormProps {
  order: Order
  onClose: () => void
}

export function EditOrderForm({ order, onClose }: EditOrderFormProps) {
  const items = useCartStore((s) => s.items)
  const { data: admins = [] } = useAdmins()
  const { mutate: updateOrder, isPending } = useUpdateOrder()

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    store_name: order.store_name,
    store_address: order.store_address ?? '',
    store_contact: order.store_contact ?? '',
    notes: order.notes ?? '',
  })
  const [adminId, setAdminId] = useState(order.admin_id ?? '')

  const adminOptions = admins.map((a) => ({ value: a.id, label: a.full_name }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateOrder(
      {
        originalOrderId: order.id,
        payload: { storeInfo, items, adminId },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre de la tienda"
        value={storeInfo.store_name}
        onChange={(e) => setStoreInfo((s) => ({ ...s, store_name: e.target.value }))}
        required
      />
      <Input
        label="Dirección"
        value={storeInfo.store_address}
        onChange={(e) => setStoreInfo((s) => ({ ...s, store_address: e.target.value }))}
      />
      <Input
        label="Contacto"
        value={storeInfo.store_contact}
        onChange={(e) => setStoreInfo((s) => ({ ...s, store_contact: e.target.value }))}
      />
      <Input
        label="Notas"
        value={storeInfo.notes}
        onChange={(e) => setStoreInfo((s) => ({ ...s, notes: e.target.value }))}
      />
      {adminOptions.length > 0 && (
        <Select
          label="Administrador"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          options={adminOptions}
          placeholder="Seleccionar..."
        />
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending} className="flex-1">
          Guardar nueva versión
        </Button>
      </div>
    </form>
  )
}
