import { supabase } from '@/app/config/supabaseClient'
import type { Profile } from '@/types/database.types'

export const sellerService = {
  async getSellers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .order('full_name', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getAdmins(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('full_name', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async updateUser(
    id: string,
    updates: { full_name?: string; phone?: string; role?: 'seller' | 'admin' },
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
