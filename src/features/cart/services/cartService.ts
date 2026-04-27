import { supabase } from '@/app/config/supabaseClient'
import type { CartItemWithProduct } from '@/types/database.types'

const CART_SELECT = '*, product:products(*), variant:product_variants(id, label, stock_quantity)'

export const cartService = {
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(CART_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as CartItemWithProduct[]
  },

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string,
    fulfillmentSource: 'stock' | 'container' = 'stock',
  ): Promise<CartItemWithProduct> {
    // Merge only when same product + variant + fulfillment_source
    // Different source = separate cart lines (stock and pre-order are distinct intents)
    let existingQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('fulfillment_source', fulfillmentSource)

    if (variantId) {
      existingQuery = existingQuery.eq('variant_id', variantId)
    } else {
      existingQuery = existingQuery.is('variant_id', null)
    }

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select(CART_SELECT)
        .single()
      if (error) throw error
      return data as CartItemWithProduct
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        variant_id: variantId ?? null,
        quantity,
        fulfillment_source: fulfillmentSource,
      })
      .select(CART_SELECT)
      .single()
    if (error) throw error
    return data as CartItemWithProduct
  },

  async updateItem(id: string, quantity: number): Promise<void> {
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', id)
    if (error) throw error
  },

  async removeItem(id: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('id', id)
    if (error) throw error
  },

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId)
    if (error) throw error
  },
}
