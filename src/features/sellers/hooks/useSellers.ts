import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sellerService } from '@/features/sellers/services/sellerService'

export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: () => sellerService.getSellers(),
  })
}

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: () => sellerService.getAdmins(),
  })
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => sellerService.getAllUsers(),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: { full_name?: string; phone?: string; role?: 'seller' | 'admin' }
    }) => sellerService.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Usuario actualizado')
    },
    onError: () => {
      toast.error('Error al actualizar el usuario')
    },
  })
}
