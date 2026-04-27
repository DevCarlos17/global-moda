import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Pagination } from './Pagination'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { SortParams } from '@/types/common.types'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortField?: string
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  totalItems: number
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  sortParams: SortParams | null
  onSort: (field: string) => void
  onRowClick?: (item: T) => void
  filterSlot?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  searchPlaceholder?: string
  getRowKey: (item: T) => string
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  totalItems,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  searchQuery,
  onSearchChange,
  sortParams,
  onSort,
  onRowClick,
  filterSlot,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No se encontraron registros',
  searchPlaceholder = 'Buscar...',
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        {filterSlot && <div className="flex items-center gap-2 flex-wrap">{filterSlot}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium whitespace-nowrap',
                    col.sortField && 'cursor-pointer select-none hover:text-white/70 transition-colors',
                    col.headerClassName,
                  )}
                  onClick={col.sortField ? () => onSort(col.sortField!) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortField && (
                      <SortIcon field={col.sortField} sortParams={sortParams} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows columns={columns.length} />
            ) : data.length === 0 ? null : (
              data.map((item) => (
                <tr
                  key={getRowKey(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={cn(
                    'border-b border-white/[0.05] transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-white/[0.04]',
                    !onRowClick && 'hover:bg-white/[0.02]',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('py-3 px-4', col.className)}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && data.length === 0 && (
          <div className="py-10">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  )
}

function SortIcon({
  field,
  sortParams,
}: {
  field: string
  sortParams: SortParams | null
}) {
  if (sortParams?.field !== field) {
    return <ChevronsUpDown size={12} className="text-white/20" />
  }
  return sortParams.direction === 'asc' ? (
    <ChevronUp size={12} className="text-gold" />
  ) : (
    <ChevronDown size={12} className="text-gold" />
  )
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-white/[0.05]">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="py-3 px-4">
              <div
                className="h-4 rounded-md bg-white/10 animate-pulse"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
