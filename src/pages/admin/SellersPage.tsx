import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAllUsers } from '@/features/sellers/hooks/useSellers'
import { CreateUserModal } from '@/features/sellers/components/CreateUserModal'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useClientTable } from '@/hooks/useClientTable'
import { formatDate } from '@/utils/formatDate'
import { ErrorState } from '@/components/feedback/ErrorState'
import { cn } from '@/utils/cn'
import type { Profile, UserRole } from '@/types/database.types'
import type { Column } from '@/components/ui/DataTable'

const COLUMNS: Column<Profile>[] = [
  {
    key: 'full_name',
    header: 'Nombre',
    sortField: 'full_name',
    render: (user) => (
      <span className="font-medium text-white">{user.full_name}</span>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    sortField: 'email',
    render: (user) => <span className="text-white/60">{user.email}</span>,
  },
  {
    key: 'phone',
    header: 'Teléfono',
    render: (user) => (
      <span className="text-white/60">{user.phone ?? '—'}</span>
    ),
  },
  {
    key: 'role',
    header: 'Rol',
    render: (user) => (
      <Badge variant={user.role === 'admin' ? 'gold' : 'info'}>
        {user.role === 'admin' ? 'Admin' : 'Vendedor'}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    header: 'Desde',
    sortField: 'created_at',
    render: (user) => (
      <span className="text-white/40 text-xs">{formatDate(user.created_at)}</span>
    ),
  },
]

type RoleFilter = 'all' | UserRole

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all',    label: 'Todos' },
  { value: 'seller', label: 'Vendedores' },
  { value: 'admin',  label: 'Administradores' },
]

export function SellersPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const { data: allUsers = [], isLoading, error, refetch } = useAllUsers()

  const filteredByRole = roleFilter === 'all'
    ? allUsers
    : allUsers.filter((u) => u.role === roleFilter)

  const table = useClientTable<Profile>({
    data: filteredByRole,
    searchFields: ['full_name', 'email'],
    pageSize: 10,
  })

  if (error) return <ErrorState onRetry={refetch} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Usuarios</h1>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus size={16} />
          Nuevo usuario
        </Button>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-4">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setRoleFilter(f.value); table.setPage(1) }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              roleFilter === f.value
                ? 'border-white/40 text-white bg-white/10'
                : 'border-white/10 text-white/50 hover:text-white hover:border-white/25',
            )}
          >
            {f.label}
            <span className={cn(
              'ml-1.5 text-[10px]',
              roleFilter === f.value ? 'text-white/60' : 'text-white/30',
            )}>
              {f.value === 'all'
                ? allUsers.length
                : allUsers.filter((u) => u.role === f.value).length}
            </span>
          </button>
        ))}
      </div>

      <DataTable<Profile>
        data={table.paginatedData}
        columns={COLUMNS}
        isLoading={isLoading}
        totalItems={table.totalItems}
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        startIndex={table.startIndex}
        endIndex={table.endIndex}
        onPageChange={table.setPage}
        searchQuery={table.searchQuery}
        onSearchChange={table.setSearchQuery}
        sortParams={table.sortParams}
        onSort={table.handleSort}
        getRowKey={(u) => u.id}
        onRowClick={(u) => navigate(`/admin/sellers/${u.id}`)}
        searchPlaceholder="Buscar por nombre o email..."
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados con este filtro"
      />

      <CreateUserModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
