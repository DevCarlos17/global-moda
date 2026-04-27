import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateContainer } from '@/features/containers/hooks/useCreateContainer'
import { useUpdateContainer } from '@/features/containers/hooks/useUpdateContainer'
import type { Container, ContainerStatus } from '@/types/database.types'
import type { SelectOption } from '@/types/common.types'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'ordered', label: 'Pedido' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'in_customs', label: 'En aduana' },
  { value: 'arrived', label: 'Llegado' },
  { value: 'cancelled', label: 'Cancelado' },
]

interface ContainerFormModalProps {
  container?: Container | null
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  container_number: string
  supplier: string
  origin_country: string
  order_date: string
  etd: string
  eta: string
  actual_arrival: string
  status: ContainerStatus
  notes: string
  order_window_open: boolean
  order_deadline: string
}

const EMPTY_FORM: FormState = {
  container_number: '',
  supplier: '',
  origin_country: '',
  order_date: '',
  etd: '',
  eta: '',
  actual_arrival: '',
  status: 'draft',
  notes: '',
  order_window_open: false,
  order_deadline: '',
}

export function ContainerFormModal({ container, isOpen, onClose }: ContainerFormModalProps) {
  const isEditing = Boolean(container)
  const { mutate: create, isPending: creating } = useCreateContainer()
  const { mutate: update, isPending: updating } = useUpdateContainer()
  const isPending = creating || updating

  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    if (container) {
      setForm({
        container_number: container.container_number,
        supplier: container.supplier,
        origin_country: container.origin_country,
        order_date: container.order_date ?? '',
        etd: container.etd ?? '',
        eta: container.eta ?? '',
        actual_arrival: container.actual_arrival ?? '',
        status: container.status,
        notes: container.notes ?? '',
        order_window_open: container.order_window_open,
        order_deadline: container.order_deadline ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [container, isOpen])

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      container_number: form.container_number.trim(),
      supplier: form.supplier.trim(),
      origin_country: form.origin_country.trim(),
      order_date: form.order_date,
      etd: form.etd || null,
      eta: form.eta || null,
      actual_arrival: form.actual_arrival || null,
      status: form.status,
      notes: form.notes.trim() || null,
      order_window_open: form.order_window_open,
      order_deadline: form.order_deadline || null,
    }

    if (isEditing && container) {
      update(
        { id: container.id, payload },
        { onSuccess: onClose },
      )
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Container' : 'Nuevo Container'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de Container"
            placeholder="CONT-001"
            value={form.container_number}
            onChange={(e) => set('container_number', e.target.value)}
            required
          />
          <Input
            label="Proveedor"
            placeholder="Nombre del proveedor"
            value={form.supplier}
            onChange={(e) => set('supplier', e.target.value)}
            required
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="País de Origen"
            placeholder="China"
            value={form.origin_country}
            onChange={(e) => set('origin_country', e.target.value)}
            required
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          />
        </div>

        {/* Row 3 — Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha de Pedido al Proveedor"
            type="date"
            value={form.order_date}
            onChange={(e) => set('order_date', e.target.value)}
            required
          />
          <Input
            label="ETD (salida estimada)"
            type="date"
            value={form.etd}
            onChange={(e) => set('etd', e.target.value)}
          />
        </div>

        {/* Row 4 — Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="ETA (llegada estimada)"
            type="date"
            value={form.eta}
            onChange={(e) => set('eta', e.target.value)}
          />
          <Input
            label="Fecha Real de Llegada"
            type="date"
            value={form.actual_arrival}
            onChange={(e) => set('actual_arrival', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Observaciones adicionales..."
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:border-gray-400 focus:ring-gray-200 transition-colors resize-none"
          />
        </div>

        {/* Order Window Section */}
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Ventana de Pedidos
          </p>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              onClick={() => set('order_window_open', !form.order_window_open)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                form.order_window_open ? 'bg-success' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${
                  form.order_window_open ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-600">
              {form.order_window_open ? 'Ventana abierta' : 'Ventana cerrada'}
            </span>
          </label>

          {form.order_window_open && (
            <Input
              label="Fecha límite de pedidos"
              type="datetime-local"
              value={form.order_deadline}
              onChange={(e) => set('order_deadline', e.target.value)}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Guardar cambios' : 'Crear Container'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
