import { useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, X, Check, ChevronRight, ChevronDown, Folder, Tag } from 'lucide-react'
import { useCategoryTree } from '@/features/categories/hooks/useCategories'
import { useCreateCategory } from '@/features/categories/hooks/useCreateCategory'
import { useUpdateCategory } from '@/features/categories/hooks/useUpdateCategory'
import { useDeleteCategory } from '@/features/categories/hooks/useDeleteCategory'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { CategoryWithChildren } from '@/types/database.types'

function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

function flattenTree(
  cats: CategoryWithChildren[],
  depth = 0,
): Array<{ id: string; name: string; depth: number }> {
  return cats.flatMap((cat) => [
    { id: cat.id, name: cat.name, depth },
    ...flattenTree(cat.children, depth + 1),
  ])
}

// ─── Recursive tree node ──────────────────────────────────────────────────────

interface NodeProps {
  category: CategoryWithChildren
  depth?: number
  editingId: string | null
  editName: string
  isUpdating: boolean
  onStartEdit: (cat: CategoryWithChildren) => void
  onCancelEdit: () => void
  onSaveEdit: (cat: CategoryWithChildren) => void
  onDelete: (id: string, name: string) => void
  onEditNameChange: (v: string) => void
}

function CategoryNode({
  category,
  depth = 0,
  editingId,
  editName,
  isUpdating,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditNameChange,
}: NodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = category.children.length > 0
  const isEditing = editingId === category.id

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 rounded-xl border transition-colors
          ${depth === 0
            ? 'py-3 px-4 border-gray-200 bg-white'
            : 'py-2 px-3 border-gray-100 bg-gray-50'
          }
        `}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((v) => !v)}
          className={`flex-shrink-0 transition-colors ${
            hasChildren
              ? 'text-gray-400 hover:text-gray-700 cursor-pointer'
              : 'text-gray-300 cursor-default'
          }`}
        >
          {hasChildren ? (
            expanded
              ? <ChevronDown size={13} />
              : <ChevronRight size={13} />
          ) : (
            <span className="block w-[13px]" />
          )}
        </button>

        {/* Icon */}
        {hasChildren
          ? <Folder size={13} className={depth === 0 ? 'text-gray-500 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
          : <Tag size={12} className="text-gray-400 flex-shrink-0" />
        }

        {isEditing ? (
          <>
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="flex-1 !h-7 !text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={() => onSaveEdit(category)}
              disabled={isUpdating}
              className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors flex-shrink-0"
              aria-label="Guardar"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Cancelar"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <span className={`flex-1 text-sm truncate ${depth === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
              {category.name}
            </span>

            {hasChildren && (
              <span className="text-[10px] text-gray-400 tabular-nums mr-1">
                {category.children.length}
              </span>
            )}

            {depth > 0 && (
              <span className="text-[9px] text-gray-400 uppercase tracking-widest mr-1 hidden sm:inline">
                sub
              </span>
            )}

            <button
              type="button"
              onClick={() => onStartEdit(category)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Editar"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category.id, category.name)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-red-50 transition-colors flex-shrink-0"
              aria-label="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="mt-1 flex flex-col gap-1">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              editingId={editingId}
              editName={editName}
              isUpdating={isUpdating}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              onEditNameChange={onEditNameChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoryManager() {
  const { data: tree = [] } = useCategoryTree()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory } = useDeleteCategory()

  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const flatCategories = flattenTree(tree)

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createCategory(
      {
        name: newName.trim(),
        slug: toSlug(newName),
        parent_id: newParentId || null,
        display_order: flatCategories.length,
      },
      {
        onSuccess: () => {
          setNewName('')
          setNewParentId('')
        },
      },
    )
  }

  const startEdit = (cat: CategoryWithChildren) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveEdit = (cat: CategoryWithChildren) => {
    if (!editName.trim()) return
    updateCategory(
      { id: cat.id, payload: { name: editName.trim(), slug: toSlug(editName) } },
      { onSuccess: cancelEdit },
    )
  }

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `¿Eliminar "${name}"? Los productos asignados quedarán sin categoría.`,
      )
    ) {
      deleteCategory(id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Add form ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Nueva categoría</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Podés crear categorías raíz o subcategorías de una existente
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Ropa, Calzado, Camisas..."
              className="flex-1"
            />
            <Button type="submit" isLoading={isCreating} disabled={!newName.trim()}>
              <Plus size={15} />
              Agregar
            </Button>
          </div>

          {flatCategories.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                Subcategoría de
              </span>
              <select
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:border-gray-400 transition-colors"
              >
                <option value="">— Categoría raíz (nivel superior) —</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.depth)}{c.depth > 0 ? '↳ ' : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </div>

      {/* ── List ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Categorías existentes
          </h2>
          {flatCategories.length > 0 && (
            <span className="text-xs text-gray-400 tabular-nums">
              {flatCategories.length} en total
            </span>
          )}
        </div>

        {tree.length === 0 ? (
          <EmptyState
            title="Sin categorías aún"
            description="Usá el formulario de arriba para agregar la primera"
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            {tree.map((cat) => (
              <CategoryNode
                key={cat.id}
                category={cat}
                depth={0}
                editingId={editingId}
                editName={editName}
                isUpdating={isUpdating}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onDelete={handleDelete}
                onEditNameChange={setEditName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
