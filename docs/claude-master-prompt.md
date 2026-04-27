# CLAUDE MASTER PROMPT — GLOBAL MODA IMPORTS

You are a senior full-stack engineer.

Your task is to build a complete production-ready web application called:

# Global Moda Imports

A B2B catalog and order management system for sellers and administrators.

---

# IMPORTANT CONTEXT

This is NOT an e-commerce app.

It is a **sales assistant system** used in physical store visits.

Sellers:

- show catalog to customers
- build carts in real time
- submit orders to admins

Admins:

- receive orders
- approve / reject orders
- manage catalog

---

# CORE TECHNOLOGY STACK

Frontend:

- React (Vite)
- TypeScript
- TailwindCSS
- Zustand
- TanStack Query v5
- React Router DOM

Backend:

- Supabase (PostgreSQL + Auth + RLS + Edge Functions)

External:

- Cloudinary (images)
- WhatsApp Cloud API (notifications)

---

# CORE BUSINESS RULES

## Roles

### Admin

- full access
- manage products, categories, sellers
- accept / reject / complete orders
- receive WhatsApp notifications

### Seller

- can browse catalog
- can create cart
- can create orders
- can edit orders (versioning system)
- can cancel orders
- can view own order history only

---

# CRITICAL FEATURES

## 1. Catalog System

- product grid
- search by name
- category sidebar (nested categories)
- product detail page
- image carousel (Cloudinary)

---

## 2. Cart System

- global cart per seller
- add / remove / update quantity
- edit before checkout

---

## 3. Order System (IMPORTANT)

Orders must support VERSIONING:

- each modification creates a new version
- original order is preserved
- parent_order_id links versions

Statuses:

- pending
- updated
- confirmed
- rejected
- cancelled
- completed

---

## 4. Store Information in Orders

Each order includes:

- store_name
- store_owner
- store_phone
- store_address
- store_city

This is NOT a separate table.

---

## 5. Order Flow

Seller flow:

1. browse catalog
2. add items to cart
3. review order
4. enter store info
5. select admin
6. confirm order
7. order created
8. WhatsApp sent

If seller edits order:

- system creates new version
- WhatsApp sent again

---

## 6. Admin Dashboard

Admin can:

- view all orders
- filter by status
- accept order
- reject order
- mark completed
- view seller and store info

---

## 7. WhatsApp Integration

When order is created or updated:

- send WhatsApp message to selected admin
- include:
  - seller name
  - store info
  - product list
  - order version

---

## 8. Product System

Products include:

- name
- description
- speech (sales text)
- optional price (nullable → "Consultar")
- category
- stock_status:
  - in_stock
  - low_stock
  - out_of_stock
  - import_on_demand

Products support:

- multiple images
- multiple sizes (variants)

---

# UI REQUIREMENTS

## Seller UI

- Login
- Catalog page
- Product detail page
- Cart page
- Order review page
- Order success page
- My orders page
- Edit order page

---

## Admin UI

- Dashboard
- Orders management
- Products CRUD
- Categories management
- Sellers management

---

# DESIGN SYSTEM

Colors:

- Black
- White
- Gold

Brand:

GM (logo)
Global Moda Imports

---

# ARCHITECTURE RULES

- Feature-based structure (NOT page-based logic)
- TanStack Query for server state
- Zustand for UI + cart state
- Supabase for backend logic
- strict separation of:
  - services
  - hooks
  - components
  - pages

---

# DATABASE (SUPABASE)

Must use schema provided:

- users
- categories (nested)
- products
- product_images
- product_variants
- carts
- cart_items
- orders (versioned)
- order_items

RLS must be enabled.

---

# SECURITY RULES

- Sellers can only access their own data
- Admins have full access
- Orders must be protected via RLS
- No direct frontend bypass allowed

---

# IMPORTANT UX RULES

- Mobile-first design
- Fast catalog browsing
- Simple checkout flow
- Minimal clicks to order
- Clear order review before submission

---

# PERFORMANCE GOALS

- optimized queries
- cached product catalog
- minimal re-renders
- image lazy loading

---

# FINAL INSTRUCTION

Generate the full application following all above rules.

Prioritize:

1. correctness of business logic
2. clean architecture
3. scalability (but keep it simple)
4. mobile UX
5. maintainability

DO NOT build a generic e-commerce system.

This is a **B2B sales order management system**.

---

END OF PROMPT
