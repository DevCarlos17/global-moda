# Global Moda Imports — Project Structure

## Overview

This document defines the frontend project structure for **Global Moda Imports**, a B2B catalog and order management system.

The structure is designed to be:

- Modular
- Scalable
- Maintainable
- Easy to understand
- Compatible with Supabase backend

This project follows a **feature-based architecture**, not a page-based one.

---

# Frontend Tech Stack

- React
- Vite
- TypeScript
- TanStack Query v5
- Zustand
- TailwindCSS
- Supabase JS Client
- React Router DOM

---

# Root Folder Structure

```bash
global-moda/

├── public/
│
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

# app/

Global configuration logic.

```bash
app/

├── providers/
│   ├── QueryProvider.tsx
│   ├── SupabaseProvider.tsx
│
├── config/
│   ├── queryClient.ts
│   ├── supabaseClient.ts
```

---

## QueryProvider.tsx

Configures:

- TanStack Query Client
- Global cache behavior

---

## SupabaseClient.ts

Initializes Supabase connection.

```ts
createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

# assets/

Static resources.

```bash
assets/

├── images/
├── icons/
├── logos/
│   └── gm-logo.png
```

Brand assets stored here.

---

# components/

Reusable UI components.

These are **global UI components**.

```bash
components/

├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│
├── feedback/
│   ├── Loader.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│
├── navigation/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│
├── media/
│   ├── ImageViewer.tsx
│   ├── ImageCarousel.tsx
```

---

# features/

Core business modules.

This is the **most important folder**.

Each feature contains:

- components
- hooks
- services
- types

---

```bash
features/

├── auth/
├── catalog/
├── cart/
├── orders/
├── admin/
├── categories/
├── sellers/
```

---

# Feature: auth/

Authentication logic.

```bash
auth/

├── components/
│   ├── LoginForm.tsx
│
├── hooks/
│   ├── useLogin.ts
│   ├── useLogout.ts
│   ├── useAuthUser.ts
│
├── services/
│   ├── authService.ts
│
├── types/
│   ├── auth.types.ts
```

Handles:

- Login
- Logout
- Session management

---

# Feature: catalog/

Product browsing.

```bash
catalog/

├── components/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilterSidebar.tsx
│   ├── ProductSearchBar.tsx
│
├── hooks/
│   ├── useProducts.ts
│   ├── useProductDetail.ts
│   ├── useSearchProducts.ts
│
├── services/
│   ├── catalogService.ts
│
├── types/
│   ├── product.types.ts
```

Handles:

- Product listing
- Filters
- Search
- Product detail

---

# Feature: cart/

Cart management.

```bash
cart/

├── components/
│   ├── CartItem.tsx
│   ├── CartList.tsx
│   ├── CartSummary.tsx
│
├── hooks/
│   ├── useCart.ts
│
├── services/
│   ├── cartService.ts
│
├── store/
│   ├── cartStore.ts
```

Uses:

Zustand for cart state.

---

# Feature: orders/

Order creation and versioning.

```bash
orders/

├── components/
│   ├── OrderReviewForm.tsx
│   ├── OrderNotesInput.tsx
│   ├── OrderVersionList.tsx
│
├── hooks/
│   ├── useCreateOrder.ts
│   ├── useUpdateOrder.ts
│   ├── useCancelOrder.ts
│   ├── useOrdersHistory.ts
│
├── services/
│   ├── orderService.ts
│
├── types/
│   ├── order.types.ts
```

Handles:

- Create order
- Edit order
- Cancel order
- Order versions

---

# Feature: admin/

Admin dashboard.

```bash
admin/

├── components/
│   ├── DashboardStats.tsx
│   ├── OrderTable.tsx
│   ├── StatusBadge.tsx
│
├── hooks/
│   ├── useAdminOrders.ts
│   ├── useUpdateOrderStatus.ts
│
├── services/
│   ├── adminService.ts
```

Handles:

- Admin controls
- Order management

---

# Feature: categories/

Category management.

```bash
categories/

├── components/
│   ├── CategoryTree.tsx
│
├── hooks/
│   ├── useCategories.ts
│
├── services/
│   ├── categoryService.ts
```

Supports nested categories.

---

# Feature: sellers/

Seller management.

```bash
sellers/

├── components/
│   ├── SellerTable.tsx
│
├── hooks/
│   ├── useSellers.ts
│
├── services/
│   ├── sellerService.ts
```

Admin only.

---

# hooks/

Global hooks.

```bash
hooks/

├── useDebounce.ts
├── useMediaQuery.ts
```

Reusable utilities.

---

# layouts/

Page layout templates.

```bash
layouts/

├── AdminLayout.tsx
├── SellerLayout.tsx
├── AuthLayout.tsx
```

Controls:

- Sidebar
- Navbar
- Page structure

---

# pages/

Route-level components.

```bash
pages/

├── auth/
│   ├── LoginPage.tsx
│
├── seller/
│   ├── CatalogPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── ReviewOrderPage.tsx
│   ├── OrdersPage.tsx
│
├── admin/
│   ├── DashboardPage.tsx
│   ├── ProductsPage.tsx
│   ├── CategoriesPage.tsx
│   ├── SellersPage.tsx
│   ├── OrdersPage.tsx
```

Pages only orchestrate features.

---

# routes/

Application routing.

```bash
routes/

├── AppRouter.tsx
├── ProtectedRoute.tsx
├── AdminRoute.tsx
```

Handles:

- Authentication
- Role-based access

---

# services/

External integrations.

```bash
services/

├── cloudinaryService.ts
├── whatsappService.ts
```

Handles:

- Image upload
- WhatsApp sending

---

# store/

Global Zustand stores.

```bash
store/

├── authStore.ts
├── uiStore.ts
```

Handles:

- User session
- UI state

---

# types/

Global TypeScript types.

```bash
types/

├── user.types.ts
├── common.types.ts
```

Shared across modules.

---

# utils/

Utility helpers.

```bash
utils/

├── formatCurrency.ts
├── generateOrderNumber.ts
├── calculateTotals.ts
```

Reusable logic.

---

# Environment Variables (.env)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

VITE_WHATSAPP_API_URL=
VITE_WHATSAPP_TOKEN=
```

---

# Recommended Naming Conventions

Components:

PascalCase

Example:

ProductCard.tsx

---

Hooks:

camelCase

Example:

useProducts.ts

---

Services:

camelCase

Example:

orderService.ts

---

# State Management Strategy

Uses:

Zustand

For:

- Cart
- Auth session
- UI state

Uses:

TanStack Query

For:

- Server data
- API caching
- Mutations

---

# Data Fetching Pattern

Use:

TanStack Query hooks.

Example:

useProducts()

Handles:

- Fetching
- Caching
- Refetching

---

# Image Handling Strategy

Upload:

Cloudinary

Save:

URL in database.

Display:

ImageCarousel component.

---

# Routing Strategy

Use:

React Router DOM.

Supports:

- Protected routes
- Admin-only routes

---

# Security Strategy

Use:

Supabase RLS policies.

Example:

- Sellers only access own orders
- Admin access all orders

---

# Recommended Development Workflow

1. Setup project
2. Setup Supabase
3. Setup authentication
4. Build catalog
5. Build cart
6. Build orders
7. Build admin dashboard
8. Integrate WhatsApp
9. Polish UI

---

# End of Project Structure
