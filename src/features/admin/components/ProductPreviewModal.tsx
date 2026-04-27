import { useNavigate } from 'react-router-dom'
import { X, Pencil, Tag, ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ImageCarousel } from '@/components/media/ImageCarousel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'
import type { ProductWithCategory } from '@/types/database.types'

interface ProductPreviewModalProps {
  product: ProductWithCategory | null
  onClose: () => void
}

export function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  const navigate = useNavigate()

  const handleEdit = () => {
    onClose()
    navigate(`/admin/products/${product!.id}/edit`)
  }

  return (
    <Modal isOpen={!!product} onClose={onClose} size="xl" noPadding>
      {product && (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-h-0">
          {/* ── Left: images ───────────────────────────────────────────── */}
          <div className="p-6 sm:border-r border-white/10">
            <ImageCarousel images={product.images} alt={product.name} />
          </div>

          {/* ── Right: info ────────────────────────────────────────────── */}
          <div className="p-6 flex flex-col gap-5 border-t sm:border-t-0 border-white/10">
            {/* Close + status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {product.is_active ? (
                  <Badge variant="success">Activo</Badge>
                ) : (
                  <Badge variant="error">Inactivo</Badge>
                )}
                {product.stock_quantity === 0 && (
                  <Badge variant="warning">Sin stock</Badge>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* SKU + Name */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider font-mono mb-1">
                {product.sku}
              </p>
              <h2 className="text-xl font-semibold text-white leading-snug">
                {product.name}
              </h2>
            </div>

            {/* Price */}
            <p className="text-3xl font-bold text-gold">
              {formatCurrency(product.price)}
            </p>

            {/* Category */}
            {product.category ? (
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <Tag size={13} className="flex-shrink-0" />
                <span>{product.category.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-white/25">
                <Tag size={13} className="flex-shrink-0" />
                <span>Sin categoría</span>
              </div>
            )}

            {/* Description */}
            {product.description ? (
              <p className="text-sm text-white/60 leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-white/25 italic">Sin descripción</p>
            )}

            <div className="border-t border-white/10" />

            {/* Stock */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Stock disponible</span>
              <div className="flex items-center gap-1.5">
                <ShoppingBag
                  size={13}
                  className={product.stock_quantity > 0 ? 'text-success' : 'text-error'}
                />
                <span
                  className={`text-sm font-semibold ${
                    product.stock_quantity > 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {product.stock_quantity > 0
                    ? `${product.stock_quantity} unidades`
                    : 'Sin stock'}
                </span>
              </div>
            </div>

            {/* Images count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Imágenes cargadas</span>
              <span className="text-sm text-white/60">
                {product.images.length} {product.images.length === 1 ? 'foto' : 'fotos'}
              </span>
            </div>

            {/* Edit CTA */}
            <div className="mt-auto pt-2">
              <Button onClick={handleEdit} variant="outline" className="w-full gap-2">
                <Pencil size={14} />
                Editar producto
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
