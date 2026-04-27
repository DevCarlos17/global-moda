import { supabase } from '@/app/config/supabaseClient'
import type { ProductVariant } from '@/types/database.types'

type CreateVariantPayload = Omit<ProductVariant, 'id' | 'created_at'>
type UpdateVariantPayload = Partial<Omit<ProductVariant, 'id' | 'created_at' | 'product_id'>>

export const variantService = {
  async getByProductId(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async create(payload: CreateVariantPayload): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: UpdateVariantPayload): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('product_variants').delete().eq('id', id)
    if (error) throw error
  },
}
