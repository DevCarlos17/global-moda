import { supabase } from '@/app/config/supabaseClient'
import type { Product, ProductWithCategory } from '@/types/database.types'
import type { ProductFilters } from '@/features/catalog/types/product.types'

export const catalogService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductWithCategory[]> {
    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      name_asc:   { column: 'name',  ascending: true },
      name_desc:  { column: 'name',  ascending: false },
      price_asc:  { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
    }
    const { column, ascending } = sortMap[filters.sort ?? 'name_asc']

    let query = supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(id,label,stock_quantity,price_override,is_active,display_order)')
      .order(column, { ascending })

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    } else {
      // Default: show only active products for sellers
      query = query.eq('is_active', true)
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      query = query.in('category_id', filters.categoryIds)
    } else if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      )
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as ProductWithCategory[]
  },

  async getAllProducts(filters: ProductFilters = {}): Promise<ProductWithCategory[]> {
    return catalogService.getProducts({ ...filters, isActive: undefined })
  },

  async getProductById(id: string): Promise<ProductWithCategory> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as ProductWithCategory
  },

  async createProduct(payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateProduct(
    id: string,
    payload: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}
