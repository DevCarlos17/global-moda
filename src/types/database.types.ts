// ─── User / Profile ──────────────────────────────────────────────────────────

export type UserRole = 'seller' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  created_at: string
  updated_at: string
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  display_order: number
  created_at: string
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
}

// ─── Product Variants ─────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  product_id: string
  label: string
  attributes: Record<string, string>
  stock_quantity: number
  price_override: number | null
  is_active: boolean
  display_order: number
  created_at: string
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  stock_quantity: number
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithCategory extends Product {
  category: Category | null
  variants?: ProductVariant[]
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  fulfillment_source: 'stock' | 'container'
  created_at: string
}

export interface CartItemWithProduct extends CartItem {
  product: Product
  variant: Pick<ProductVariant, 'id' | 'label' | 'stock_quantity'> | null
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'awaiting_container'
  | 'in_transit'
  | 'in_customs'
  | 'in_warehouse'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderType = 'seller' | 'customer'

export interface Order {
  id: string
  order_number: string
  seller_id: string | null
  admin_id: string | null
  status: OrderStatus
  order_type: OrderType
  version: number
  parent_order_id: string | null
  store_name: string
  store_address: string | null
  store_contact: string | null
  notes: string | null
  total_amount: number
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  container_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  fulfillment_source: 'stock' | 'container' | null
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product
}

export interface OrderWithDetails extends Order {
  items: OrderItemWithProduct[]
  seller: Profile | null
  admin: Profile | null
  container: Container | null
}

// Lighter shape used in the seller orders list — includes container summary
// but not the full items array (only fulfillment_source for pre-order detection)
export interface OrderListItem extends Order {
  container: Pick<Container, 'container_number' | 'status' | 'eta'> | null
  has_preorder: boolean // computed: at least one item with fulfillment_source='container'
  has_stock: boolean    // computed: at least one item with fulfillment_source='stock'
}

// ─── Containers ──────────────────────────────────────────────────────────────

export type ContainerStatus =
  | 'draft'
  | 'ordered'
  | 'in_transit'
  | 'in_customs'
  | 'arrived'
  | 'cancelled'

export interface Container {
  id: string
  container_number: string
  supplier: string
  origin_country: string
  order_date: string
  etd: string | null
  eta: string | null
  actual_arrival: string | null
  status: ContainerStatus
  notes: string | null
  total_cost: number
  order_window_open: boolean
  order_deadline: string | null
  created_at: string
  updated_at: string
}

// ─── Container Stock Items ("Compra Propia") ─────────────────────────────────

export interface ContainerStockItem {
  id: string
  container_id: string
  product_id: string
  variant_id: string | null
  ordered_qty: number
  received_qty: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ContainerStockItemWithProduct extends ContainerStockItem {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'images' | 'stock_quantity'>
  variant: Pick<ProductVariant, 'id' | 'label' | 'stock_quantity'> | null
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryProduct {
  id: string
  sku: string
  name: string
  images: string[]
  price: number
  stock_quantity: number
  category_id: string | null
  category_name: string | null
  is_active: boolean
  variants: Pick<ProductVariant, 'id' | 'label' | 'stock_quantity'>[]
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  totalRevenue: number
  totalProducts: number
  activeProducts: number
  totalSellers: number
}

export interface OrderStatusCounts {
  draft: number
  pending: number
  confirmed: number
  processing: number
  awaiting_container: number
  in_transit: number
  in_customs: number
  in_warehouse: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface RecentOrder {
  id: string
  order_number: string
  seller_name: string | null
  customer_name: string | null
  total_amount: number
  status: OrderStatus
  order_type: OrderType
  created_at: string
}

export interface LowStockProduct {
  id: string
  name: string
  sku: string
  stock_quantity: number
}

export interface ExtendedDashboardStats extends DashboardStats {
  statusCounts: OrderStatusCounts
  recentOrders: RecentOrder[]
  lowStockProducts: LowStockProduct[]
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  sellerOrdersCount: number
  customerOrdersCount: number
}
