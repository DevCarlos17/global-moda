import { Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useDeleteProduct } from '@/features/admin/hooks/useDeleteProduct'

interface DeleteProductModalProps {
  product: { id: string; name: string } | null
  onClose: () => void
}

export function DeleteProductModal({ product, onClose }: DeleteProductModalProps) {
  const { mutate: deleteProduct, isPending } = useDeleteProduct()

  const handleConfirm = () => {
    if (!product) return
    deleteProduct(product.id, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title="Eliminar producto"
      size="sm"
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-white/70">
          ¿Seguro que querés eliminar{' '}
          <span className="text-white font-medium">"{product?.name}"</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            <Trash2 size={14} />
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
