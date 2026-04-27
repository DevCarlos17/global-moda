import { useMemo } from 'react'
import { GitBranch, Folder, Tag } from 'lucide-react'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { CategoryWithChildren } from '@/types/database.types'

function countAll(cats: CategoryWithChildren[]): number {
  return cats.reduce((sum, cat) => sum + 1 + countAll(cat.children), 0)
}

// ─── Tree node ─────────────────────────────────────────────────────────────

interface TreeNodeProps {
  category: CategoryWithChildren
  depth?: number
}

function TreeNode({ category, depth = 0 }: TreeNodeProps) {
  const hasChildren = category.children.length > 0

  return (
    <div>
      <div
        className={
          depth === 0
            ? 'flex items-center gap-2.5 py-2 px-3 rounded-lg'
            : 'flex items-center gap-2.5 py-1.5 px-3 rounded-lg'
        }
      >
        {hasChildren ? (
          <Folder
            size={14}
            className={depth === 0 ? 'text-gold flex-shrink-0' : 'text-white/35 flex-shrink-0'}
          />
        ) : (
          <Tag size={12} className="text-white/25 flex-shrink-0" />
        )}

        <span
          className={
            depth === 0
              ? 'text-sm font-medium text-white truncate flex-1'
              : 'text-sm text-white/60 truncate flex-1'
          }
        >
          {category.name}
        </span>

        {hasChildren && (
          <span className="text-[11px] text-white/25 tabular-nums flex-shrink-0">
            {category.children.length}
          </span>
        )}
      </div>

      {hasChildren && (
        <div className="ml-[26px] border-l border-white/10 pl-2.5 flex flex-col gap-0.5 mb-1">
          {category.children.map((child) => (
            <TreeNode key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Preview panel ──────────────────────────────────────────────────────────

export function CategoryTreePreview() {
  const { data: tree = [] } = useCategoryTree()

  const totalCount = useMemo(() => countAll(tree), [tree])
  const rootCount = tree.length
  const subCount = totalCount - rootCount

  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-5 flex flex-col gap-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={15} className="text-gold" />
          <h2 className="text-sm font-semibold text-white">Árbol de categorías</h2>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-white/30">{totalCount} total</span>
        )}
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{rootCount}</p>
            <p className="text-[11px] text-white/40 mt-0.5">principales</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{subCount}</p>
            <p className="text-[11px] text-white/40 mt-0.5">subcategorías</p>
          </div>
        </div>
      )}

      {totalCount > 0 && <div className="border-t border-white/10" />}

      {/* Tree */}
      {tree.length === 0 ? (
        <EmptyState
          title="Sin categorías"
          description="Crea la primera para verla aquí"
        />
      ) : (
        <div className="flex flex-col gap-0.5">
          {tree.map((cat) => (
            <TreeNode key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}
