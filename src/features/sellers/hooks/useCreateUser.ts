import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/app/config/supabaseClient'

export interface CreateUserPayload {
  email: string
  password: string
  full_name: string
  role: 'seller' | 'admin'
  phone: string
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      // Llamamos a la Edge Function — el service_role key queda en el servidor
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: payload,
      })

      if (error) throw new Error(error.message)

      // La Edge Function devuelve { error } en el body cuando hay un error lógico
      if (data?.error) throw new Error(data.error)

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario creado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el usuario')
    },
  })
}
