import type { CartItemWithProduct } from '@/types/database.types'

export interface CustomerOrderPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address?: string
  notes?: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
    name: string
  }>
  totalAmount: number
}

export interface StoreInfo {
  store_name: string
  store_address: string
  store_contact: string
  notes: string
}

export interface CreateOrderPayload {
  storeInfo: StoreInfo
  items: CartItemWithProduct[]
  adminId: string
}
