import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { containerStockService } from '@/features/containers/services/containerStockService'

export function useContainerStock(containerId: string | undefined) {
  return useQuery({
    queryKey: ['containers', containerId, 'stock'],
    queryFn: () => containerStockService.getByContainer(containerId!),
    enabled: Boolean(containerId),
  })
}

export function useUpsertContainerStockItem(containerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      orderedQty,
      notes,
    }: {
      productId: string
      variantId: string | null
      orderedQty: number
      notes?: string
    }) => containerStockService.upsertItem(containerId, productId, variantId, orderedQty, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'stock'] })
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'aggregation'] })
      toast.success('Producto agregado')
    },
    onError: () => toast.error('Error al guardar el producto'),
  })
}

export function useDeleteContainerStockItem(containerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => containerStockService.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'stock'] })
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'aggregation'] })
      toast.success('Producto eliminado')
    },
    onError: () => toast.error('Error al eliminar el producto'),
  })
}

export function useReceiveContainerStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      containerId,
      items,
    }: {
      containerId: string
      items: { product_id: string; variant_id: string | null; received_qty: number }[]
    }) => containerStockService.receiveStock(containerId, items),
    onSuccess: (_, { containerId }) => {
      queryClient.invalidateQueries({ queryKey: ['containers', containerId, 'stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Mercancía recibida — stock actualizado')
    },
    onError: () => toast.error('Error al confirmar la recepción'),
  })
}
