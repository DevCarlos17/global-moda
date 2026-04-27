import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateUser } from '@/features/sellers/hooks/useCreateUser'
import type { SelectOption } from '@/types/common.types'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
}

const roleOptions: SelectOption[] = [
  { value: 'seller', label: 'Vendedor' },
  { value: 'admin', label: 'Administrador' },
]

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const { mutate: createUser, isPending } = useCreateUser()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'seller' as 'seller' | 'admin',
    phone: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createUser(
      { ...formData },
      {
        onSuccess: () => {
          onClose()
          setFormData({ email: '', password: '', full_name: '', role: 'seller', phone: '' })
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo usuario"
      description="Crea un vendedor o administrador"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre completo *"
          value={formData.full_name}
          onChange={(e) => setFormData((d) => ({ ...d, full_name: e.target.value }))}
          required
        />
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
          required
        />
        <Input
          label="Contraseña *"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData((d) => ({ ...d, password: e.target.value }))}
          minLength={6}
          required
        />
        <Input
          label="WhatsApp *"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value.replace(/\D/g, '') }))}
          placeholder="Ej: 584141641502 (sin +, solo dígitos)"
          required
        />
        <Select
          label="Rol *"
          value={formData.role}
          onChange={(e) => setFormData((d) => ({ ...d, role: e.target.value as 'seller' | 'admin' }))}
          options={roleOptions}
        />

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending} className="flex-1">
            Crear usuario
          </Button>
        </div>
      </form>
    </Modal>
  )
}
