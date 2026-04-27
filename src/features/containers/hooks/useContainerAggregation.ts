import { useQuery } from '@tanstack/react-query'
import { containerAggregationService } from '@/features/containers/services/containerAggregationService'

export function useContainerAggregation(containerId: string | undefined) {
  return useQuery({
    queryKey: ['containers', containerId, 'aggregation'],
    queryFn: () => containerAggregationService.getAggregatedItems(containerId!),
    enabled: Boolean(containerId),
  })
}
