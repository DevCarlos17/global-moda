import { useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Check, X, Package } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useProductVariants } from '@/features/variants/hooks/useProductVariants'
import { useUpdateVariant } from '@/features/variants/hooks/useUpdateVariant'
import { useDeleteVariant } from '@/features/variants/hooks/useDeleteVariant'
import { variantService } from '@/features/variants/services/variantService'
import { SizeSelector } from './SizeSelector'
import { ColorSelector } from './ColorSelector'
import { VariantMatrix } from './VariantMatrix'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { ProductVariant } from '@/types/database.types'

type VariantMode = 'legacy' | 'size' | 'color' | 'size_color'

const LABEL_PRESETS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  'Negro', 'Blanco', 'Rojo', 'Beige', 'Azul', 'Marrón',
]

const MODE_TABS: { id: VariantMode; label: string }[] = [
  { id: 'legacy', label: 'Libre' },
  { id: 'size', label: 'Por talla' },
  { id: 'color', label: 'Por color' },
  { id: 'size_color', label: 'Talla + color' },
]

// ─── Local draft type (used before product is saved to DB) ────────────────────

export type LocalVariantDraft = {
  id: string // temporary ID, e.g. crypto.randomUUID()
  label: string
  attributes: Record<string, string>
  stock_quantity: number
  price_override: number | null
  is_active: boolean
  display_order: number
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VariantManagerProps {
  productId?: string
  productPrice: number | string
  // Local mode: used when creating a new product (no DB yet)
  localMode?: boolean
  localVariants?: LocalVariantDraft[]
  onLocalVariantsChange?: (variants: LocalVariantDraft[]) => void
}

export function VariantManager({
  productId,
  productPrice,
  localMode,
  localVariants,
  onLocalVariantsChange,
}: VariantManagerProps) {
  const queryClient = useQueryClient()
  const { data: dbVariants = [] } = useProductVariants(localMode ? undefined : productId)
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant(productId ?? '')
  const { mutate: deleteVariant } = useDeleteVariant(productId ?? '')

  // Unified display list
  const displayVariants: Array<Pick<ProductVariant, 'id' | 'label' | 'stock_quantity' | 'price_override'>> =
    localMode ? (localVariants ?? []) : dbVariants

  // Mode
  const [mode, setMode] = useState<VariantMode>('legacy')

  // Legacy mode state
  const [newLabel, setNewLabel] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [isCreatingLegacy, setIsCreatingLegacy] = useState(false)

  // Size mode state
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sizeStocks, setSizeStocks] = useState<Record<string, string>>({})

  // Color mode state
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [colorStocks, setColorStocks] = useState<Record<string, string>>({})

  // Size+Color mode state
  const [sc_sizes, setScSizes] = useState<string[]>([])
  const [sc_colors, setScColors] = useState<string[]>([])
  const [matrixStocks, setMatrixStocks] = useState<Record<string, string>>({})

  // Batch create loading (only used in DB mode)
  const [isBatchCreating, setIsBatchCreating] = useState(false)

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editPrice, setEditPrice] = useState('')

  // ── Local mode helpers ─────────────────────────────────────────────────────

  const addLocalVariants = (drafts: LocalVariantDraft[]) => {
    onLocalVariantsChange?.([...(localVariants ?? []), ...drafts])
  }

  const makeDraft = (
    label: string,
    attributes: Record<string, string>,
    stock_quantity: number,
    price_override: number | null,
    order: number,
  ): LocalVariantDraft => ({
    id: crypto.randomUUID(),
    label,
    attributes,
    stock_quantity,
    price_override,
    is_active: true,
    display_order: order,
  })

  // ── Batch create helper ────────────────────────────────────────────────────

  type VariantPayload = {
    label: string
    attributes: Record<string, string>
    stock_quantity: number
    price_override: number | null
    is_active: boolean
    display_order: number
  }

  const batchCreate = async (payloads: VariantPayload[]) => {
    if (payloads.length === 0) {
      toast.warning('No hay variantes nuevas para crear')
      return
    }

    if (localMode) {
      const base = displayVariants.length
      const drafts = payloads.map((p, i) =>
        makeDraft(p.label, p.attributes, p.stock_quantity, p.price_override, base + i),
      )
      addLocalVariants(drafts)
      toast.success(`${drafts.length} variante${drafts.length !== 1 ? 's' : ''} agregada${drafts.length !== 1 ? 's' : ''}`)
      return
    }

    setIsBatchCreating(true)
    try {
      await Promise.all(
        payloads.map((p) =>
          variantService.create({
            product_id: productId!,
            ...p,
          }),
        ),
      )
      await queryClient.invalidateQueries({ queryKey: ['variants', productId] })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(
        `${payloads.length} variante${payloads.length !== 1 ? 's' : ''} creada${payloads.length !== 1 ? 's' : ''}`,
      )
    } catch {
      toast.error('Error al crear variantes')
    } finally {
      setIsBatchCreating(false)
    }
  }

  // ── Legacy create ──────────────────────────────────────────────────────────

  const handleCreateLegacy = async (e: FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim()) return

    if (localMode) {
      const draft = makeDraft(
        newLabel.trim(),
        {},
        parseInt(newStock) || 0,
        newPrice ? parseFloat(newPrice) : null,
        displayVariants.length,
      )
      addLocalVariants([draft])
      toast.success('Variante agregada')
      setNewLabel('')
      setNewStock('')
      setNewPrice('')
      return
    }

    setIsCreatingLegacy(true)
    try {
      await variantService.create({
        product_id: productId!,
        label: newLabel.trim(),
        attributes: {},
        stock_quantity: parseInt(newStock) || 0,
        price_override: newPrice ? parseFloat(newPrice) : null,
        is_active: true,
        display_order: displayVariants.length,
      })
      await queryClient.invalidateQueries({ queryKey: ['variants', productId] })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Variante agregada')
      setNewLabel('')
      setNewStock('')
      setNewPrice('')
    } catch {
      toast.error('Error al agregar variante')
    } finally {
      setIsCreatingLegacy(false)
    }
  }

  // ── Size mode create ───────────────────────────────────────────────────────

  const handleCreateSizes = async () => {
    const existingKeys = new Set(
      dbVariants
        .filter((v) => v.attributes?.type === 'size')
        .map((v) => v.attributes.size),
    )
    const newSizes = localMode
      ? selectedSizes
      : selectedSizes.filter((s) => !existingKeys.has(s))
    await batchCreate(
      newSizes.map((size, i) => ({
        label: size,
        attributes: { type: 'size', size },
        stock_quantity: parseInt(sizeStocks[size] || '0') || 0,
        price_override: null,
        is_active: true,
        display_order: displayVariants.length + i,
      })),
    )
    setSelectedSizes([])
    setSizeStocks({} as Record<string, string>)
  }

  // ── Color mode create ──────────────────────────────────────────────────────

  const handleCreateColors = async () => {
    const existingKeys = new Set(
      dbVariants
        .filter((v) => v.attributes?.type === 'color')
        .map((v) => v.attributes.color),
    )
    const newColors = localMode
      ? selectedColors
      : selectedColors.filter((c) => !existingKeys.has(c))
    await batchCreate(
      newColors.map((color, i) => ({
        label: color,
        attributes: { type: 'color', color },
        stock_quantity: parseInt(colorStocks[color] || '0') || 0,
        price_override: null,
        is_active: true,
        display_order: displayVariants.length + i,
      })),
    )
    setSelectedColors([])
    setColorStocks({})
  }

  // ── Size+Color mode create ─────────────────────────────────────────────────

  const handleCreateMatrix = async () => {
    const existingKeys = new Set(
      dbVariants
        .filter((v) => v.attributes?.type === 'size_color')
        .map((v) => `${v.attributes.size}__${v.attributes.color}`),
    )
    const combos = sc_sizes.flatMap((size, si) =>
      sc_colors.map((color, ci) => ({
        key: `${size}__${color}`,
        size,
        color,
        order: si * sc_colors.length + ci,
      })),
    )
    const newCombos = localMode ? combos : combos.filter((c) => !existingKeys.has(c.key))
    await batchCreate(
      newCombos.map((c) => ({
        label: `${c.size} / ${c.color}`,
        attributes: { type: 'size_color', size: c.size, color: c.color },
        stock_quantity: parseInt(matrixStocks[c.key] || '0') || 0,
        price_override: null,
        is_active: true,
        display_order: displayVariants.length + c.order,
      })),
    )
    setScSizes([])
    setScColors([])
    setMatrixStocks({})
  }

  // ── Inline edit ────────────────────────────────────────────────────────────

  const startEdit = (v: { id: string; label: string; stock_quantity: number; price_override: number | null }) => {
    setEditingId(v.id)
    setEditLabel(v.label)
    setEditStock(String(v.stock_quantity))
    setEditPrice(v.price_override != null ? String(v.price_override) : '')
  }

  const saveEdit = (id: string) => {
    if (!editLabel.trim()) return

    if (localMode) {
      onLocalVariantsChange?.(
        (localVariants ?? []).map((v) =>
          v.id === id
            ? {
                ...v,
                label: editLabel.trim(),
                stock_quantity: parseInt(editStock) || 0,
                price_override: editPrice ? parseFloat(editPrice) : null,
              }
            : v,
        ),
      )
      setEditingId(null)
      return
    }

    updateVariant(
      {
        id,
        payload: {
          label: editLabel.trim(),
          stock_quantity: parseInt(editStock) || 0,
          price_override: editPrice ? parseFloat(editPrice) : null,
        },
      },
      { onSuccess: () => setEditingId(null) },
    )
  }

  const handleDelete = (id: string, label: string) => {
    if (!window.confirm(`¿Eliminar variante "${label}"?`)) return

    if (localMode) {
      onLocalVariantsChange?.((localVariants ?? []).filter((v) => v.id !== id))
      return
    }

    deleteVariant(id)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Variantes del producto</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Tallas, colores u otras opciones. Cada variante tiene su propio stock.
          </p>
        </div>
        {displayVariants.length > 0 && (
          <span className="text-xs text-gray-400 tabular-nums">
            {displayVariants.length} variante{displayVariants.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              mode === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/60',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create panel based on mode */}
      <div className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        {/* ── LEGACY ──────────────────────────────────────────────────── */}
        {mode === 'legacy' && (
          <form onSubmit={handleCreateLegacy} className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Nueva variante libre
            </p>
            <div className="flex flex-wrap gap-1.5">
              {LABEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewLabel((l) => (l ? `${l} / ${preset}` : preset))}
                  className="px-2.5 py-1 rounded-full text-xs border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_80px_90px] gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ej: M / Rojo, Negro, Talla 38..."
                className="!h-9 !text-sm"
              />
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 text-center focus:outline-none focus:border-gray-400"
                placeholder="Stock"
                min="0"
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 text-center focus:outline-none focus:border-gray-400"
                placeholder="Precio"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                Precio vacío → base ({formatCurrency(Number(productPrice))})
              </p>
              <Button
                type="submit"
                size="sm"
                isLoading={isCreatingLegacy}
                disabled={!newLabel.trim()}
              >
                <Plus size={14} />
                Agregar
              </Button>
            </div>
          </form>
        )}

        {/* ── SIZE ────────────────────────────────────────────────────── */}
        {mode === 'size' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Seleccioná las tallas
            </p>
            <SizeSelector selected={selectedSizes} onChange={setSelectedSizes} />
            {selectedSizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Stock por talla
                </p>
                {selectedSizes.map((size) => (
                  <div key={size} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 w-12">{size}</span>
                    <input
                      type="number"
                      value={sizeStocks[size] ?? ''}
                      onChange={(e) =>
                        setSizeStocks((prev) => ({ ...prev, [size]: e.target.value }))
                      }
                      className="h-8 w-24 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 text-center focus:outline-none focus:border-gray-400"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              size="sm"
              isLoading={isBatchCreating}
              disabled={selectedSizes.length === 0}
              onClick={handleCreateSizes}
              className="self-end"
            >
              <Plus size={14} />
              Agregar {selectedSizes.length > 0 ? selectedSizes.length : ''} variante
              {selectedSizes.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* ── COLOR ───────────────────────────────────────────────────── */}
        {mode === 'color' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Seleccioná los colores
            </p>
            <ColorSelector selected={selectedColors} onChange={setSelectedColors} />
            {selectedColors.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Stock por color
                </p>
                {selectedColors.map((color) => (
                  <div key={color} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 w-24">{color}</span>
                    <input
                      type="number"
                      value={colorStocks[color] ?? ''}
                      onChange={(e) =>
                        setColorStocks((prev) => ({ ...prev, [color]: e.target.value }))
                      }
                      className="h-8 w-24 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 text-center focus:outline-none focus:border-gray-400"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              size="sm"
              isLoading={isBatchCreating}
              disabled={selectedColors.length === 0}
              onClick={handleCreateColors}
              className="self-end"
            >
              <Plus size={14} />
              Agregar {selectedColors.length > 0 ? selectedColors.length : ''} variante
              {selectedColors.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* ── SIZE + COLOR ─────────────────────────────────────────────── */}
        {mode === 'size_color' && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                Tallas
              </p>
              <SizeSelector selected={sc_sizes} onChange={setScSizes} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                Colores
              </p>
              <ColorSelector selected={sc_colors} onChange={setScColors} />
            </div>
            {(sc_sizes.length > 0 || sc_colors.length > 0) && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                  Stock por combinación (matriz)
                </p>
                <VariantMatrix
                  sizes={sc_sizes}
                  colors={sc_colors}
                  stocks={matrixStocks}
                  onStocksChange={setMatrixStocks}
                />
              </div>
            )}
            <Button
              type="button"
              size="sm"
              isLoading={isBatchCreating}
              disabled={sc_sizes.length === 0 || sc_colors.length === 0}
              onClick={handleCreateMatrix}
              className="self-end"
            >
              <Plus size={14} />
              Agregar{' '}
              {sc_sizes.length * sc_colors.length > 0 ? sc_sizes.length * sc_colors.length : ''}{' '}
              variante{sc_sizes.length * sc_colors.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>

      {/* Existing / local variants list */}
      {displayVariants.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_80px_90px_56px] gap-2 px-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Variante</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
              Stock
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
              Precio
            </span>
            <span />
          </div>

          {displayVariants.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-[1fr_80px_90px_56px] gap-2 items-center p-3 bg-gray-50 border border-gray-200 rounded-xl"
            >
              {editingId === v.id ? (
                <>
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="!h-8 !text-sm"
                    autoFocus
                  />
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 text-center focus:outline-none focus:border-gray-400"
                    min="0"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 text-center focus:outline-none focus:border-gray-400"
                    step="0.01"
                    min="0"
                    placeholder="—"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => saveEdit(v.id)}
                      disabled={isUpdating}
                      className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">{v.label}</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm text-center tabular-nums',
                      v.stock_quantity > 0 ? 'text-success' : 'text-error',
                    )}
                  >
                    {v.stock_quantity}
                  </span>
                  <span className="text-sm text-center text-gray-500 tabular-nums">
                    {v.price_override != null ? formatCurrency(v.price_override) : '—'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id, v.label)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
