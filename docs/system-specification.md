# Global Moda Imports — System Specification (Enhanced Version)

## Project Name

**Global Moda**
**Subtitle:** Imports

Global Moda Imports is a private **B2B catalog and order management system** used by sellers to collect product orders from stores and send those orders to administrators for fulfillment.

This system supports **order versioning**, **modifications**, and **WhatsApp notifications**.

---

# System Overview

Global Moda is **not an e-commerce store**.

It is a **sales support system** used in physical store visits.

Sellers visit stores, collect orders using the catalog, and submit them to administrators.

Orders are:

- Saved in the system
- Sent to Admin Dashboard
- Delivered to Admin via WhatsApp
- Editable through versioning

---

# Core Technologies

## Frontend

- React
- TanStack Query v5
- Zustand
- TailwindCSS

## Backend

- Supabase

Includes:

- PostgreSQL
- Authentication
- Row Level Security (RLS)
- Edge Functions

## External Services

- Cloudinary — Image storage
- WhatsApp Cloud API — Notifications

---

# User Roles

---

## Admin

Admins control the system.

Permissions:

- Create Admin users
- Create Seller users
- Create Products
- Create Categories
- Upload product images
- View Orders
- Accept Orders
- Reject Orders
- Mark Orders as Completed
- Receive WhatsApp notifications
- Access Admin Dashboard

---

## Seller

Sellers collect store orders.

Permissions:

- Login
- View catalog
- Search products
- Filter categories
- View product details
- Add products to cart
- Edit cart
- Submit orders
- Modify orders (creates new version)
- Cancel orders
- Enter store information
- Select Admin recipient
- View order history

Restrictions:

- Cannot create products
- Cannot access Admin dashboard

---

# Core Business Flow

---

# Seller Order Flow

1. Seller logs in
2. Seller browses catalog
3. Seller selects products
4. Seller adds products to cart
5. Seller edits cart
6. Seller proceeds to Review Order
7. Seller enters Store Information
8. Seller selects Admin
9. Seller confirms order
10. System creates Order Version 1
11. WhatsApp notification is sent
12. Order appears in Admin Dashboard

---

# Order Modification Flow (Versioning)

If a store requests changes:

1. Seller opens existing order
2. Seller clicks **Edit Order**
3. System duplicates last version
4. New version is created
5. Seller edits items
6. Seller confirms changes
7. New WhatsApp notification is sent
8. Order history keeps all versions

---

# Order Cancellation Flow

1. Seller selects order
2. Seller clicks **Cancel Order**
3. Order status becomes:

cancelled

4. WhatsApp notification sent

---

# Admin Order Flow

Admin can:

- View orders
- Accept orders
- Reject orders
- Mark orders completed

Order statuses:

- pending
- updated
- confirmed
- rejected
- cancelled
- completed

---

# Database Schema

---

# users

```sql
id uuid primary key
name text
email text unique
phone text
role text (admin | seller)
created_at timestamp
```

Authentication handled via Supabase Auth.

---

# categories

Supports nested hierarchy.

```sql
id uuid primary key
name text
parent_id uuid nullable
created_at timestamp
```

Used for sidebar filtering.

---

# products

```sql
id uuid primary key
name text
description text
speech text
price numeric nullable
category_id uuid
stock_status text
created_at timestamp
```

stock_status values:

- in_stock
- low_stock
- out_of_stock
- import_on_demand

Ordering is allowed even when out_of_stock.

---

# product_images

```sql
id uuid primary key
product_id uuid
image_url text
display_order integer
```

Stored in Cloudinary.

Supports multiple images.

---

# product_variants

```sql
id uuid primary key
product_id uuid
size text
price numeric nullable
```

Example sizes:

S
M
L
XL

---

# carts

```sql
id uuid primary key
seller_id uuid
status text (active | completed)
created_at timestamp
```

Each seller has one active cart.

---

# cart_items

```sql
id uuid primary key
cart_id uuid
product_id uuid
variant_id uuid nullable
quantity integer
```

---

# orders (Enhanced Versioning)

```sql
id uuid primary key

seller_id uuid
admin_id uuid

parent_order_id uuid nullable
version integer

store_name text
store_owner text
store_phone text
store_address text
store_city text

order_notes text nullable

status text

created_at timestamp
```

Important Fields:

parent_order_id → tracks original order
version → order version number
order_notes → custom seller notes

---

# order_items

```sql
id uuid primary key
order_id uuid
product_id uuid
variant_id uuid nullable
quantity integer
price_snapshot numeric nullable
```

Stores product state at time of order.

---

# Product Behavior

Products support:

- Multiple images
- Multiple sizes
- Optional price
- Category assignment
- Stock label

If:

price = NULL

Display:

Consultar

---

# Cart Behavior

Seller can:

- Add items
- Remove items
- Edit quantity
- Review summary

Cart remains active until order submission.

---

# Order Review Screen

Before sending order:

Seller must review:

- Product list
- Quantities
- Store Information
- Selected Admin
- Order Notes

Seller can still edit.

After confirmation:

Order becomes locked.

---

# Order History — Seller

Seller sees:

- Order list
- Version numbers
- Status
- Store info
- Product details

---

# Admin Dashboard

Includes:

---

## Orders Panel

Displays:

- New orders
- Updated orders
- Order versions
- Seller name
- Store name
- Status

Admin actions:

- Confirm Order
- Reject Order
- Complete Order

---

## Products Panel

Admin can:

- Create products
- Edit products
- Upload images
- Assign categories
- Set price
- Set stock status

---

## Categories Panel

Admin can:

- Create categories
- Create subcategories
- Edit hierarchy

---

## Sellers Panel

Admin can:

- Create Seller users
- Create Admin users

---

# Search System

Supports:

- Partial text match
- Product name search

Example:

"camisa negra"

---

# Filtering System

Sidebar filtering:

Supports:

- Parent categories
- Child categories

Marketplace-style filtering.

---

# WhatsApp Notification System

Triggered when:

- Order created
- Order updated
- Order cancelled

Uses:

Supabase Edge Functions
WhatsApp Cloud API

---

# WhatsApp Message Types

---

## New Order

Includes:

Seller
Store
Products
Version

---

## Updated Order

Includes:

Order ID
Version number
Updated items

---

## Cancelled Order

Includes:

Order ID
Cancellation notice

---

# Responsive Design Requirements

Mobile-first design.

Must support:

- Android phones
- iPhones
- Tablets

Important:

- Large touch targets
- Scrollable layouts
- Responsive grids

---

# Branding Guidelines

---

## Colors

Primary:

Black
White
Gold

---

## Logo

GM

G → Gold
M → White
Background → Black

Text:

Global Moda
Imports

---

# UI Screens — Seller

- Login
- Catalog
- Product Detail
- Cart
- Review Order
- Order Success
- My Orders
- Edit Order
- Cancel Order

---

# UI Screens — Admin

- Dashboard
- Orders
- Products
- Categories
- Sellers

---

# Image Handling Flow

1. Admin uploads image
2. Image stored in Cloudinary
3. URL saved to database

---

# Security Model

Uses:

- Supabase Authentication
- Role-based permissions
- Row Level Security (RLS)

Admin-only features restricted.

---

# Future Improvements (Optional)

- Favorite Stores
- Duplicate Order
- Multi-language support
- Reports Dashboard
- Inventory tracking
- Mobile App

---

# End of Enhanced Specification
