// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  code?: string
  details?: string
}

// ─── Select Option ────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  publicId: string
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export interface SortParams {
  field: string
  direction: SortDirection
}
