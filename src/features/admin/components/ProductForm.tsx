import { useState, type FormEvent, type ChangeEvent, type DragEvent } from 'react'
import { Upload, X, Star, ShoppingBag, Ship, GripHorizontal } from 'lucide-react'
import { useCreateProduct } from '@/features/admin/hooks/useCreateProduct'
import { useUpdateProduct } from '@/features/admin/hooks/useUpdateProduct'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'
import { useImageUpload } from '@/features/admin/hooks/useImageUpload'
import { variantService } from '@/features/variants/services/variantService'
import { VariantManager, type LocalVariantDraft } from '@/features/admin/components/VariantManager'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ImageViewer } from '@/components/media/ImageViewer'
import { formatCurrency } from '@/utils/formatCurrency'
import type { CategoryWithChildren, Product, ProductWithCategory } from '@/types/database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenCategoryTree(
  cats: CategoryWithChildren[],
  depth = 0,
): Array<{ value: string; label: string }> {
  return cats.flatMap((cat) => [
    { value: cat.id, label: `${'— '.repeat(depth)}${cat.name}` },
    ...flattenCategoryTree(cat.children, depth + 1),
  ])
}

function findCategoryName(tree: CategoryWithChildren[], id: string): string | undefined {
  for (const cat of tree) {
    if (cat.id === id) return cat.name
    const found = findCategoryName(cat.children, id)
    if (found) return found
  }
}

// ─── Live preview ─────────────────────────────────────────────────────────────

type PreviewVariant = { id: string; label: string; stock_quantity: number }

interface ProductPreviewCardProps {
  name: string
  sku: string
  price: string
  categoryName: string | undefined
  image: string | null
  variants: PreviewVariant[]
}

function ProductPreviewCard({ name, sku, price, categoryName, image, variants }: ProductPreviewCardProps) {
  const parsedPrice = Number(price) || 0
  const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0)
  const hasStock = totalStock > 0
  const activeVariants = variants.filter((v) => v.stock_quantity > 0)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] text-white/25 uppercase tracking-widest text-center">
        Vista previa
      </p>

      <div className="flex flex-col bg-surface border border-white/10 rounded-2xl overflow-hidden">
        {/* Image — taller for the bigger column */}
        <div className="aspect-[4/3] bg-white/5 overflow-hidden relative">
          {image ? (
            <img
              src={image}
              alt={name || 'Producto'}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full flex flex-col items-center justify-center gap-3 text-white/10">
              <ShoppingBag size={40} />
              <span className="text-xs text-white/20">Sin imagen</span>
            </div>
          )}
          {variants.length > 0 && !hasStock && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-xs font-medium text-info backdrop-blur-sm">
              <Ship size={11} />
              Pre-pedido
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2">
          {/* SKU + Category */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-white/25 uppercase tracking-wider font-mono truncate">
              {sku || 'SKU-000'}
            </span>
            {categoryName && (
              <span className="text-[11px] text-white/40 truncate shrink-0 max-w-[55%]">
                {categoryName}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5em]">
            {name ? (
              <span className="text-white">{name}</span>
            ) : (
              <span className="text-white/20">Nombre del producto</span>
            )}
          </h3>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 min-h-[1.1rem]">
            {variants.length > 0 ? (
              hasStock ? (
                <>
                  <span className="size-1.5 rounded-full flex-shrink-0 bg-success" />
                  <span className="text-xs text-white/40">
                    {activeVariants.length} {activeVariants.length === 1 ? 'opción disponible' : 'opciones disponibles'}
                  </span>
                </>
              ) : (
                <>
                  <Ship size={10} className="text-info flex-shrink-0" />
                  <span className="text-xs text-info/70">Pre-pedido</span>
                </>
              )
            ) : (
              <span className="text-xs text-white/15">Sin variantes aún</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <span className="font-bold text-base">
              {parsedPrice > 0 ? (
                <span className="text-gold">{formatCurrency(parsedPrice)}</span>
              ) : (
                <span className="text-white/20">$ —</span>
              )}
            </span>
            <div className="size-8 flex items-center justify-center rounded-lg bg-white/8 text-white/20">
              <ShoppingBag size={14} />
            </div>
          </div>
        </div>

        {/* Variant chips */}
        {variants.length > 0 && (
          <div className="px-4 pb-4 flex flex-wrap gap-1.5">
            {variants.slice(0, 10).map((v) => (
              <span
                key={v.id}
                className="px-2.5 py-0.5 rounded-full text-[11px] border border-white/10 text-white/40"
              >
                {v.label}
              </span>
            ))}
            {variants.length > 10 && (
              <span className="text-[11px] text-white/20 self-center pl-1">
                +{variants.length - 10} más
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: ProductWithCategory
}

export function ProductForm({ product }: ProductFormProps) {
  const { data: categoryTree = [] } = useCategoryTree()
  const { mutate: update, isPending: isUpdating } = useUpdateProduct()
  const { upload, isUploading } = useImageUpload()

  const isEditing = Boolean(product)

  const [formData, setFormData] = useState({
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    is_active: product?.is_active ?? true,
  })
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [localVariants, setLocalVariants] = useState<LocalVariantDraft[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const categoryOptions = flattenCategoryTree(categoryTree)
  const categoryName = formData.category_id
    ? findCategoryName(categoryTree, formData.category_id)
    : undefined

  const previewVariants: PreviewVariant[] = isEditing
    ? (product?.variants ?? []).map((v) => ({
        id: v.id,
        label: v.label,
        stock_quantity: v.stock_quantity,
      }))
    : localVariants

  const { mutate: create, isPending: isCreating } = useCreateProduct(
    isEditing
      ? undefined
      : async (newProduct: Product) => {
          if (localVariants.length === 0) return
          await Promise.all(
            localVariants.map((v, i) =>
              variantService.create({
                product_id: newProduct.id,
                label: v.label,
                attributes: v.attributes,
                stock_quantity: v.stock_quantity,
                price_override: v.price_override,
                is_active: v.is_active,
                display_order: i,
              }),
            ),
          )
        },
  )

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    for (const file of Array.from(files)) {
      const url = await upload(file)
      if (url) setImages((prev) => [...prev, url])
    }
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const setAsPrimary = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      const [selected] = next.splice(index, 1)
      return [selected, ...next]
    })
  }

  const handleDragStart = (e: DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    setImages((prev) => {
      const next = [...prev]
      const [dragged] = next.splice(dragIndex, 1)
      next.splice(dropIndex, 0, dragged)
      return next
    })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const stockQuantity = localVariants.reduce((sum, v) => sum + v.stock_quantity, 0)
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock_quantity: stockQuantity,
      category_id: formData.category_id || null,
      images,
    }
    if (isEditing && product) {
      update({ id: product.id, payload })
    } else {
      create(payload)
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Columna izquierda: los 3 componentes apilados ────────────── */}
        <div className="flex flex-col gap-6">

          {/* 1. Imágenes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Imágenes</p>
              {images.length > 0 && (
                <p className="text-xs text-white/30">
                  Toca <Star size={10} className="inline mb-0.5" /> para poner de portada
                </p>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <div
                  key={url}
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`relative size-28 flex-shrink-0 rounded-xl transition-all duration-150 cursor-grab active:cursor-grabbing ${
                    dragIndex === i
                      ? 'opacity-40 scale-95'
                      : dragOverIndex === i && dragIndex !== null
                        ? 'ring-2 ring-gold ring-offset-2 ring-offset-surface'
                        : ''
                  }`}
                >
                  <ImageViewer src={url} alt={`Imagen ${i + 1}`} className="size-full rounded-xl object-cover pointer-events-none" />

                  {/* Drag handle hint */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 pointer-events-none">
                    <GripHorizontal size={14} className="text-white/40 drop-shadow-sm" />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center bg-error rounded-full text-white"
                  >
                    <X size={10} />
                  </button>

                  {/* Primary indicator */}
                  {i === 0 ? (
                    <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/60 rounded-md px-1.5 py-0.5 text-[10px] text-gold font-medium">
                      <Star size={9} className="fill-gold" />
                      Portada
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsPrimary(i)}
                      title="Poner de portada"
                      className="absolute bottom-1 left-1 size-6 flex items-center justify-center bg-black/60 rounded-md text-white/50 hover:text-gold hover:bg-black/80 transition-colors"
                    >
                      <Star size={12} />
                    </button>
                  )}
                </div>
              ))}
              <label
                className={`size-28 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-gold/50 transition-colors ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {isUploading ? (
                  <span className="size-5 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={20} className="text-white/30" />
                    <span className="text-xs text-white/30">Subir foto</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </Card>

          {/* 2. Información del producto */}
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Información del producto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SKU *"
                value={formData.sku}
                onChange={(e) => setFormData((d) => ({ ...d, sku: e.target.value }))}
                required
              />
              <Input
                label="Nombre *"
                value={formData.name}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                required
              />
              <Input
                label="Precio *"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((d) => ({ ...d, price: e.target.value }))}
                required
              />
              <Select
                label="Categoría"
                value={formData.category_id}
                onChange={(e) => setFormData((d) => ({ ...d, category_id: e.target.value }))}
                options={categoryOptions}
                placeholder="Sin categoría"
              />
              <div className="sm:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Descripción del producto..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((d) => ({ ...d, is_active: e.target.checked }))}
                    className="size-4 accent-gold"
                  />
                  <span className="text-sm text-white/70">Producto activo</span>
                </label>
              </div>
            </div>
          </Card>

          {/* 3. Variantes */}
          <Card>
            {isEditing && product ? (
              <VariantManager productId={product.id} productPrice={formData.price} />
            ) : (
              <VariantManager
                localMode
                localVariants={localVariants}
                onLocalVariantsChange={setLocalVariants}
                productPrice={formData.price}
              />
            )}
          </Card>

        </div>

        {/* ── Columna derecha: preview grande + submit ──────────────────── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <ProductPreviewCard
            name={formData.name}
            sku={formData.sku}
            price={formData.price}
            categoryName={categoryName}
            image={images[0] ?? null}
            variants={previewVariants}
          />
          <Button type="submit" isLoading={isPending} size="lg" className="w-full">
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>

      </div>
    </form>
  )
}
