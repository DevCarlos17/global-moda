import { supabase } from '@/app/config/supabaseClient'
import type { Container } from '@/types/database.types'

type CreateContainerPayload = Omit<Container, 'id' | 'created_at' | 'updated_at'>
type UpdateContainerPayload = Partial<Omit<Container, 'id' | 'created_at' | 'updated_at'>>

export const containerService = {
  async getAll(): Promise<Container[]> {
    const { data, error } = await supabase
      .from('containers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Container> {
    const { data, error } = await supabase
      .from('containers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload: CreateContainerPayload): Promise<Container> {
    const { data, error } = await supabase
      .from('containers')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: UpdateContainerPayload): Promise<Container> {
    const { data, error } = await supabase
      .from('containers')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('containers').delete().eq('id', id)
    if (error) throw error
  },

  async openWindow(id: string, deadline: string): Promise<Container> {
    return containerService.update(id, { order_window_open: true, order_deadline: deadline })
  },

  async closeWindow(id: string): Promise<Container> {
    return containerService.update(id, { order_window_open: false, order_deadline: null })
  },

  async getOpenWindow(): Promise<Container | null> {
    const { data, error } = await supabase
      .from('containers')
      .select('*')
      .eq('order_window_open', true)
      .maybeSingle()
    if (error) throw error
    return data
  },
}
