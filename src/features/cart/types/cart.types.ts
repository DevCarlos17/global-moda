export interface AddToCartPayload {
  userId: string
  productId: string
  quantity: number
  variantId?: string
  fulfillmentSource?: 'stock' | 'container'
}
