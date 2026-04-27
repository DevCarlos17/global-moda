import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { containerService } from '@/features/containers/services/containerService'

export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => containerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
      toast.success('Container eliminado')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el container')
    },
  })
}
