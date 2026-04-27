import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/features/auth/services/authService'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/app/config/supabaseClient'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import type { UserRole } from '@/types/database.types'

export function useLogin() {
  const navigate = useNavigate()
  const { setUser, setSession, setRole } = useAuthStore()

  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) =>
      authService.login(email, password),
    onSuccess: async (data) => {
      setUser(data.user)
      setSession(data.session)

      // Read role from profiles table — source of truth
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = (profile?.role as UserRole) ?? null
      setRole(role)

      if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/catalog')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al iniciar sesión')
    },
  })
}
