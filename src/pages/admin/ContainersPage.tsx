import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ship, Plus, Trash2 } from 'lucide-react'
import { useContainers } from '@/features/containers/hooks/useContainers'
import { useDeleteContainer } from '@/features/containers/hooks/useDeleteContainer'
import { ContainerFormModal } from '@/features/containers/components/ContainerFormModal'
import { ContainerStatusBadge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useClientTable } from '@/hooks/useClientTable'
import { formatDate } from '@/utils/formatDate'
import type { Container, ContainerStatus } from '@/types/database.types'
import type { Column } from '@/components/ui/DataTable'
import type { SelectOption } from '@/types/common.types'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'ordered', label: 'Pedido' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'in_customs', label: 'En aduana' },
  { value: 'arrived', label: 'Llegado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const filterFn = (c: Container, filters: Record<string, string>): boolean => {
  if (filters.status && filters.status !== 'all' && c.status !== filters.status) return false
  return true
}

export function ContainersPage() {
  const { data: containers = [], isLoading, error, refetch } = useContainers()
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [containerToDelete, setContainerToDelete] = useState<Container | null>(null)
  const deleteContainer = useDeleteContainer()
  const navigate = useNavigate()

  const COLUMNS: Column<Container>[] = [
    {
      key: 'container_number',
      header: 'Número',
      sortField: 'container_number',
      render: (c) => (
        <div className="flex items-center gap-2">
          <Ship size={14} className="text-white/30 flex-shrink-0" />
          <span className="font-medium text-white">{c.container_number}</span>
          {c.order_window_open && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-success/15 text-success uppercase tracking-wide">
              Ventana abierta
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'supplier',
      header: 'Proveedor',
      sortField: 'supplier',
      render: (c) => <span className="text-white/70">{c.supplier}</span>,
    },
    {
      key: 'origin_country',
      header: 'País',
      sortField: 'origin_country',
      render: (c) => <span className="text-white/50 text-xs">{c.origin_country}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (c) => <ContainerStatusBadge status={c.status as ContainerStatus} />,
    },
    {
      key: 'etd',
      header: 'ETD',
      sortField: 'etd',
      render: (c) => (
        <span className="text-white/40 text-xs">{c.etd ? formatDate(c.etd) : '—'}</span>
      ),
    },
    {
      key: 'eta',
      header: 'ETA',
      sortField: 'eta',
      render: (c) => (
        <span className="text-white/40 text-xs">{c.eta ? formatDate(c.eta) : '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setContainerToDelete(c)
          }}
          className="p-1.5 rounded-lg text-white/30 hover:text-error hover:bg-error/10 transition-colors"
          aria-label="Eliminar container"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ]

  const table = useClientTable<Container>({
    data: containers,
    searchFields: ['container_number', 'supplier'],
    pageSize: 10,
    filterFn,
  })

  if (error) return <ErrorState onRetry={refetch} />

  const filterSlot = (
    <Select
      options={STATUS_OPTIONS}
      value={table.filters.status ?? 'all'}
      onChange={(e) => table.setFilter('status', e.target.value)}
      className="!h-9 !text-xs min-w-[160px]"
      aria-label="Filtrar por estado"
    />
  )

  function handleRowClick(c: Container) {
    navigate(`/admin/containers/${c.id}`)
  }

  function handleNewClick() {
    setSelectedContainer(null)
    setModalOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <Ship size={20} className="text-gold" />
          <h1 className="text-2xl font-semibold text-white">Containers</h1>
        </div>
        <Button size="sm" onClick={handleNewClick}>
          <Plus size={14} />
          Nuevo Container
        </Button>
      </div>

      <DataTable<Container>
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
        onRowClick={handleRowClick}
        filterSlot={filterSlot}
        getRowKey={(c) => c.id}
        searchPlaceholder="Buscar por número o proveedor..."
        emptyTitle="Sin containers"
        emptyDescription="No hay containers que coincidan con los filtros"
      />

      <ContainerFormModal
        container={selectedContainer}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <Modal
        isOpen={containerToDelete !== null}
        onClose={() => setContainerToDelete(null)}
        title="Eliminar container"
        size="sm"
      >
        <p className="text-sm text-white/70 mb-6">
          ¿Estás seguro que querés eliminar el container{' '}
          <span className="font-semibold text-white">
            {containerToDelete?.container_number}
          </span>
          ? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setContainerToDelete(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteContainer.isPending}
            onClick={() => {
              if (!containerToDelete) return
              deleteContainer.mutate(containerToDelete.id, {
                onSuccess: () => setContainerToDelete(null),
              })
            }}
          >
            <Trash2 size={14} />
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
