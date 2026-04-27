import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'
import { cn } from '@/utils/cn'
import type { CategoryWithChildren } from '@/types/database.types'

interface CategoryNodeProps {
  category: CategoryWithChildren
  selectedId: string | null
  onSelect: (id: string | null) => void
  depth?: number
}

function CategoryNode({ category, selectedId, onSelect, depth = 0 }: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = category.children.length > 0
  const isSelected = selectedId === category.id

  return (
    <div>
      <button
        onClick={() => {
          onSelect(isSelected ? null : category.id)
          if (hasChildren) setExpanded((v) => !v)
        }}
        className={cn(
          'flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
          isSelected ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/10',
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
        ) : (
          <span className="w-3" />
        )}
        {category.name}
      </button>

      {hasChildren && expanded && (
        <div>
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CategoryTreeProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryTree({ selectedId, onSelect }: CategoryTreeProps) {
  const { data: tree } = useCategoryTree()

  return (
    <div className="flex flex-col gap-0.5">
      {tree?.map((cat) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
