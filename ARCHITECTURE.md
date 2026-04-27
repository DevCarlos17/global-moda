# Arquitectura del Proyecto — Global Moda

## Estructura general de `src/`

```
src/
├── app/           → Configuración global (router, providers, Supabase client)
├── modules/       → Layouts de la aplicación
├── features/      → Lógica de negocio organizada por dominio
├── pages/         → Páginas conectadas a las rutas, organizadas por rol
├── components/    → Componentes de UI reutilizables sin lógica de negocio
├── hooks/         → Hooks genéricos compartidos entre features
├── utils/         → Funciones utilitarias puras
├── types/         → Definiciones de tipos TypeScript globales
├── store/         → Estado global con Zustand
├── routes/        → Wrappers de protección de rutas
├── services/      → Integraciones externas (Cloudinary, WhatsApp)
└── assets/        → Imágenes y recursos estáticos
```

---

## La distinción principal: `modules/` vs `features/` vs `pages/`

Esta es la parte que genera más confusión. Acá está la regla de oro:

| Carpeta | Pregunta clave | Ejemplo |
|---------|---------------|---------|
| `modules/` | ¿Es la **estructura visual** que envuelve una sección entera? | AdminLayout, SellerLayout |
| `features/` | ¿Tiene **lógica de negocio** propia (servicio, hook, componente)? | Cart, Orders, Containers |
| `pages/` | ¿Es una **pantalla** conectada a una ruta específica? | `/admin/orders`, `/catalog` |

---

## `modules/` — Layouts

Contiene únicamente los layouts de la aplicación. Un layout define la estructura visual que comparten varias páginas: sidebar, navbar, banner de notificaciones, etc.

```
modules/layouts/
├── AdminLayout.tsx    → Sidebar + Navbar para el panel de admin
├── SellerLayout.tsx   → Navbar + CartDrawer + OrderWindowBanner para vendedores
├── PublicLayout.tsx   → Layout para clientes sin cuenta
└── AuthLayout.tsx     → Layout para la pantalla de login
```

**Regla:** Si es solo estructura (dónde van las cosas en la pantalla), va en `modules/`.
**No incluye** lógica de negocio ni llamadas a la API.

---

## `features/` — Lógica de Negocio por Dominio

Cada feature es un dominio de negocio autocontenido. Internamente sigue siempre la misma estructura:

```
features/<nombre>/
├── services/     → Llamadas a Supabase (CRUD, queries)
├── hooks/        → useQuery / useMutation que consumen los services
└── components/   → Componentes React específicos de este dominio
```

### Features disponibles

#### `auth/`
Login, logout, sesión del usuario actual.
- `authService.ts` — llamadas a Supabase Auth
- `useLogin`, `useLogout`, `useAuthUser`
- `LoginForm.tsx`

#### `cart/`
Carrito de compras del vendedor. Incluye el store de Zustand del carrito.
- `cartService.ts` — CRUD de `cart_items` en Supabase
- `cartStore.ts` — estado local del carrito (Zustand)
- `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`
- `CartDrawer.tsx`, `CartItem.tsx`, `CartSummary.tsx`

#### `catalog/`
Catálogo de productos visible para los vendedores y el público.
- `catalogService.ts` — consultas de productos
- `useProducts`, `useProductDetail`, `useSearchProducts`
- `ProductCard.tsx`, `ProductGrid.tsx`, `ProductFilterSidebar.tsx`

#### `categories/`
Gestión del árbol de categorías.
- `categoryService.ts`
- `useCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`
- `CategoryTree.tsx`, `CategoryManager.tsx`

#### `variants/`
Variantes de productos (tallas, colores, combinaciones).
- `variantService.ts`
- `useProductVariants`, `useCreateVariant`, `useUpdateVariant`, `useDeleteVariant`

#### `orders/`
Pedidos del sistema (creación, historial, versiones).
- `orderService.ts` — incluye lógica de descuento de stock, sincronización con containers
- `useOrdersHistory`, `useOrderDetail`, `useCreateOrder`, `useCancelOrder`
- `OrderCard.tsx`, `OrderReviewForm.tsx`, `OrderVersionList.tsx`

#### `admin/`
Operaciones exclusivas del administrador.
- `adminService.ts` — estadísticas, pedidos no asignados
- `useAdminOrders`, `useUpdateOrderStatus`, `useCreateProduct`, `useDashboardStats`
- `ProductForm.tsx`, `VariantManager.tsx`, `OrderDetailModal.tsx`, `DashboardStats.tsx`

#### `sellers/`
Gestión de cuentas de vendedores.
- `sellerService.ts`
- `useSellers`, `useCreateUser`
- `CreateUserModal.tsx`

#### `containers/`
Gestión de containers de importación: estados, pedidos asignados, compra propia, recepción de stock.
- `containerService.ts` — CRUD de containers
- `containerAggregationService.ts` — lista de compra unificada (vendedores + stock propio)
- `containerStockService.ts` — compra propia del admin + RPCs de stock
- `useContainers`, `useContainerOrders`, `useAssignOrders`, `useContainerStock`, `useReceiveContainerStock`
- `ContainerStockTab.tsx`, `AssignOrdersModal.tsx`, `ReceiveStockModal.tsx`, `ContainerPurchaseList.tsx`

#### `inventory/`
Hooks para ajuste manual de stock (usados desde `ProductsPage`).
- `useInventory.ts` — `useInventoryProducts`, `useSetStock`
- `StockAdjustModal.tsx` — modal de ajuste reutilizable

#### `public/`
Componentes para el flujo de compra pública (clientes sin cuenta).
- `PublicCartDrawer.tsx`, `PublicProductCard.tsx`

---

## `pages/` — Pantallas conectadas a rutas

Las páginas **no tienen lógica de negocio propia**. Su única responsabilidad es componer features y componentes para armar una pantalla. Están organizadas por rol de usuario.

```
pages/
├── admin/         → Pantallas del panel de administración
├── seller/        → Pantallas del vendedor autenticado
├── public/        → Pantallas del cliente sin cuenta
└── auth/          → Pantalla de login
```

### `pages/admin/`
| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `DashboardPage.tsx` | `/admin` | Panel de control con métricas |
| `OrdersPage.tsx` | `/admin/orders` | Tabla de todos los pedidos con filtros |
| `ProductsPage.tsx` | `/admin/products` | Catálogo + gestión de stock |
| `ProductFormPage.tsx` | `/admin/products/new` y `/:id/edit` | Formulario de creación/edición |
| `CategoriesPage.tsx` | `/admin/categories` | Árbol de categorías |
| `SellersPage.tsx` | `/admin/sellers` | Lista de vendedores |
| `SellerProfilePage.tsx` | `/admin/sellers/:id` | Detalle de un vendedor |
| `ContainersPage.tsx` | `/admin/containers` | Lista de containers |
| `ContainerDetailPage.tsx` | `/admin/containers/:id` | Detalle del container con tabs |

### `pages/seller/`
| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `CatalogPage.tsx` | `/catalog` | Catálogo para hacer pedidos |
| `ProductDetailPage.tsx` | `/catalog/:id` | Detalle del producto (stock + pre-pedido) |
| `CartPage.tsx` | `/cart` | Carrito de compras |
| `ReviewOrderPage.tsx` | `/orders/review` | Revisión antes de confirmar |
| `OrderSuccessPage.tsx` | `/orders/success` | Confirmación de pedido |
| `OrdersPage.tsx` | `/orders` | Historial de pedidos en tabla |
| `OrderDetailPage.tsx` | `/orders/:id` | Detalle de un pedido |

### `pages/public/`
| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `PublicCatalogPage.tsx` | `/public/catalog` | Catálogo para clientes sin cuenta |
| `PublicProductDetailPage.tsx` | `/public/catalog/:id` | Detalle público |
| `PublicCheckoutPage.tsx` | `/public/checkout` | Checkout del cliente |
| `PublicOrderSuccessPage.tsx` | `/public/success` | Confirmación pública |

---

## `components/` — UI Reutilizable

Componentes visuales puros. No hacen llamadas a la API ni tienen estado de negocio.

```
components/
├── ui/           → Primitivos: Button, Input, Select, Modal, Badge, DataTable, Card, Pagination
├── feedback/     → Estados: Loader, EmptyState, ErrorState
├── media/        → ImageViewer, ImageCarousel
└── navigation/   → Navbar, Sidebar
```

**Regla:** Si un componente de UI se usa en más de un feature, va en `components/ui/`.
Si solo lo usa un feature, va dentro de ese `features/<nombre>/components/`.

---

## `hooks/` — Hooks Genéricos

Hooks que no pertenecen a ningún dominio específico y son usados por múltiples features.

- `useDebounce.ts` — retrasa la ejecución (para búsquedas)
- `useMediaQuery.ts` — detecta el tamaño de pantalla
- `useClientTable.ts` — lógica de tabla: paginación, búsqueda, ordenamiento, filtros

---

## `store/` — Estado Global (Zustand)

Solo para estado que es verdaderamente global (persiste entre rutas o lo necesitan múltiples features desconectadas).

- `authStore.ts` — usuario autenticado, rol
- `uiStore.ts` — sidebar abierto, menú móvil
- `themeStore.ts` — tema de la aplicación
- `publicCartStore.ts` — carrito del cliente público (sin cuenta)

> El carrito del vendedor (`cartStore.ts`) vive dentro de `features/cart/store/` porque solo lo usa ese feature.

---

## `utils/` — Funciones Puras

Sin estado, sin efectos secundarios, sin dependencias de React.

- `cn.ts` — combina clases de Tailwind condicionalmente
- `formatCurrency.ts` — formatea números como moneda
- `formatDate.ts` — formatea fechas
- `calculateTotals.ts` — calcula totales de carrito/pedido
- `generateOrderNumber.ts` — genera números de pedido únicos
- `orderFulfillmentType.ts` — clasifica pedidos como stock/pre-pedido/mixto

---

## `types/` — Tipos TypeScript Globales

- `database.types.ts` — todos los tipos del esquema de Supabase: `Product`, `Order`, `Container`, `CartItem`, `OrderListItem`, `ContainerStockItem`, `InventoryProduct`, etc.
- `common.types.ts` — tipos compartidos de UI: `SelectOption`, `SortParams`, etc.

---

## `app/` — Configuración de la Aplicación

```
app/
├── config/supabaseClient.ts     → Instancia del cliente de Supabase
├── providers/query-provider.tsx → TanStack Query con configuración global
├── providers/sonner-provider.tsx → Toast notifications (posición, duración)
└── router/app-router.tsx        → Todas las rutas de la aplicación
```

---

## `routes/` — Protección de Rutas

- `ProtectedRoute.tsx` — redirige al login si no hay sesión activa
- `AdminRoute.tsx` — redirige si el usuario no tiene rol `admin`

---

## `services/` — Integraciones Externas

Servicios que conectan con APIs de terceros (no Supabase).

- `cloudinaryService.ts` — subida de imágenes a Cloudinary
- `whatsappService.ts` — integración con WhatsApp

> Las integraciones con Supabase viven dentro de cada `features/<nombre>/services/`, no acá.

---

## Resumen visual del flujo

```
Ruta (/admin/orders)
    ↓
pages/admin/OrdersPage.tsx       ← arma la pantalla
    ↓ usa
features/admin/hooks/useAdminOrders.ts   ← lógica React Query
    ↓ llama
features/admin/services/adminService.ts  ← query a Supabase
    ↓ tipado con
types/database.types.ts
    ↓ renderiza
components/ui/DataTable.tsx      ← UI pura sin negocio
features/admin/components/OrderDetailModal.tsx  ← UI específica del dominio
```
