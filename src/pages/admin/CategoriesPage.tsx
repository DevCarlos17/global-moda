import { Layers } from 'lucide-react'
import { CategoryManager } from '@/features/categories/components/CategoryManager'
import { CategoryTreePreview } from '@/features/categories/components/CategoryTreePreview'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'

export function CategoriesPage() {
  const { data: tree = [] } = useCategoryTree()
  const totalCount = tree.reduce(function count(sum, cat): number {
    return sum + 1 + cat.children.reduce(count, 0)
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Layers size={20} className="text-gold" />
            <h1 className="text-2xl font-semibold text-white">Categorías</h1>
          </div>
          <p className="text-sm text-white/40">
            Organizá los productos en categorías y subcategorías para facilitar la navegación del catálogo
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-white">{totalCount}</p>
            <p className="text-xs text-white/40">
              {totalCount === 1 ? 'categoría' : 'categorías'}
            </p>
          </div>
        )}
      </div>

      {/* Tip banner — only when empty */}
      {tree.length === 0 && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-gold mt-0.5 flex-shrink-0">💡</span>
          <p className="text-xs text-white/60 leading-relaxed">
            Empezá creando las categorías principales (ej: <span className="text-white/80">Ropa</span>, <span className="text-white/80">Calzado</span>)
            y luego agregá subcategorías dentro de ellas (ej: <span className="text-white/80">Camisas</span>, <span className="text-white/80">Pantalones</span>).
          </p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <CategoryManager />
        <CategoryTreePreview />
      </div>
    </div>
  )
}
