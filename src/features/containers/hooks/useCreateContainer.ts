import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { containerService } from '@/features/containers/services/containerService'
import type { Container } from '@/types/database.types'

type CreateContainerPayload = Omit<Container, 'id' | 'created_at' | 'updated_at'>

export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateContainerPayload) => containerService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
      toast.success('Container creado')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el container')
    },
  })
}
