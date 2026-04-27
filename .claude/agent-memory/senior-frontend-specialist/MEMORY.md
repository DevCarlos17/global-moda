# Senior Frontend Specialist — Project Memory

## Project: Global Moda (React + TypeScript + Supabase + Tailwind)

### Key File Paths
- Supabase client: `src/app/config/supabaseClient.ts`
- Types: `src/types/database.types.ts`, `src/types/common.types.ts`
- Router: `src/app/router/app-router.tsx` (React Router v6, BrowserRouter)
- Sidebar nav: `src/components/navigation/Sidebar.tsx`

### Architecture Conventions
- Features live in `src/features/<domain>/` with `services/`, `hooks/`, `components/` subdirs
- Pages live in `src/pages/admin/` or `src/pages/seller/`
- Hooks use TanStack Query (`@tanstack/react-query`) — `useQuery` + `useMutation`
- Toast via `sonner` (`toast.success`, `toast.error`) — NOT react-hot-toast
- Server state: React Query; client state: Zustand

### React Query Key Conventions
- `['inventory']` — all inventory products
- `['products']` — catalog products
- `['products', 'all-simple']` — lightweight product list (id, name, sku, variants)
- `['containers', containerId, 'stock']` — container_stock_items for a container
- `['orders']` — all orders

### UI Component Patterns
- `Modal`: props `isOpen, onClose, title?, size?, noPadding?, className?`; use `noPadding` + manual header/body/footer for custom layouts
- `Button`: variants `primary|secondary|outline|ghost|danger`; prop `isLoading` shows spinner
- `Select`: requires `options: SelectOption[]`; use `className="!h-9 !text-xs"` for compact filter selects
- `DataTable`: needs `useClientTable` hook; pass `filterSlot` for filter dropdowns
- `useClientTable`: `{ data, searchFields, pageSize, filterFn }` → returns pagination + filter state

### Tailwind Color Tokens (project-specific)
- `text-gold` / `bg-gold` — gold accent (prices, brand)
- `text-success` / `bg-success/15` — green (stock ok, active)
- `text-warning` / `bg-warning/15` — amber (low stock)
- `text-error` / `bg-error/15` — red (out of stock, danger)
- `text-info` / `bg-info/15` — blue (container/info)
- `bg-surface` — dark surface background
- `bg-white/[0.03]` + `border-white/[0.06]` — card/row inner surface

### Supabase RPC Functions Added (migration 000012)
- `adjust_product_stock(p_product_id, p_variant_id, p_delta)` — atomic delta on stock
- `receive_container_stock(p_container_id, p_items JSONB)` — bulk receive + stock update
- `set_product_stock(p_product_id, p_variant_id, p_quantity)` — set absolute stock

### Stock Management Data Flow
- `container_stock_items` table: admin's own-purchase items per container
- Creating order: `adjust_product_stock` called with negative delta for `fulfillment_source='stock'` items
- Cancelling order: stock restored before cancellation via same RPC
- Receiving container: `receive_container_stock` RPC updates `received_qty` + increments stock

### OrderService variant_id Access
- `CreateOrderPayload.items` is `CartItemWithProduct[]`
- `CartItemWithProduct` extends `CartItem` which has `variant_id: string | null` and `fulfillment_source: 'stock' | 'container'`
- Safe to use `item.variant_id` and `item.fulfillment_source` in orderService
