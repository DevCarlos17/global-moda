import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-400">
        Mostrando {totalItems === 0 ? 0 : startIndex}–{endIndex} de {totalItems}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>

          {pages.map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition-colors',
                  currentPage === page
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
                )}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3)
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
