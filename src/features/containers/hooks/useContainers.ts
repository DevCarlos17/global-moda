import { useQuery } from '@tanstack/react-query'
import { containerService } from '@/features/containers/services/containerService'

export function useContainers() {
  return useQuery({
    queryKey: ['containers'],
    queryFn: () => containerService.getAll(),
  })
}

export function useContainerById(id: string | undefined) {
  return useQuery({
    queryKey: ['containers', id],
    queryFn: () => containerService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useOpenWindow() {
  return useQuery({
    queryKey: ['containers', 'open-window'],
    queryFn: () => containerService.getOpenWindow(),
  })
}
