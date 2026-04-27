-- =========================================
-- GLOBAL MODA IMPORTS - SUPABASE SCHEMA
-- =========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================
-- USERS TABLE (AUTH PROFILE EXTENSION)
-- =========================================

create table users (
id uuid primary key references auth.users(id) on delete cascade,
name text not null,
email text unique,
phone text,
role text check (role in ('admin', 'seller')) not null,
created_at timestamp default now()
);

-- =========================================
-- CATEGORIES (NESTED STRUCTURE)
-- =========================================

create table categories (
id uuid primary key default uuid_generate_v4(),
name text not null,
parent_id uuid references categories(id) on delete set null,
created_at timestamp default now()
);

-- =========================================
-- PRODUCTS
-- =========================================

create table products (
id uuid primary key default uuid_generate_v4(),
name text not null,
description text,
speech text,
price numeric null,
category_id uuid references categories(id) on delete set null,

stock_status text check (
stock_status in (
'in_stock',
'low_stock',
'out_of_stock',
'import_on_demand'
)
) default 'import_on_demand',

created_at timestamp default now()
);

-- =========================================
-- PRODUCT IMAGES (CLOUDINARY)
-- =========================================

create table product_images (
id uuid primary key default uuid_generate_v4(),
product_id uuid references products(id) on delete cascade,
image_url text not null,
display_order int default 0
);

-- =========================================
-- PRODUCT VARIANTS (SIZES)
-- =========================================

create table product_variants (
id uuid primary key default uuid_generate_v4(),
product_id uuid references products(id) on delete cascade,
size text not null,
price numeric null
);

-- =========================================
-- CARTS
-- =========================================

create table carts (
id uuid primary key default uuid_generate_v4(),
seller_id uuid references users(id) on delete cascade,
status text check (status in ('active', 'completed')) default 'active',
created_at timestamp default now()
);

-- =========================================
-- CART ITEMS
-- =========================================

create table cart_items (
id uuid primary key default uuid_generate_v4(),
cart_id uuid references carts(id) on delete cascade,
product_id uuid references products(id) on delete cascade,
variant_id uuid references product_variants(id),
quantity int not null default 1
);

-- =========================================
-- ORDERS (VERSIONED SYSTEM)
-- =========================================

create table orders (
id uuid primary key default uuid_generate_v4(),

seller_id uuid references users(id),
admin_id uuid references users(id),

parent_order_id uuid references orders(id) on delete set null,
version int default 1,

store_name text not null,
store_owner text,
store_phone text,
store_address text,
store_city text,

order_notes text,

status text check (
status in (
'pending',
'updated',
'confirmed',
'rejected',
'cancelled',
'completed'
)
) default 'pending',

created_at timestamp default now()
);

-- =========================================
-- ORDER ITEMS (SNAPSHOT)
-- =========================================

create table order_items (
id uuid primary key default uuid_generate_v4(),
order_id uuid references orders(id) on delete cascade,
product_id uuid references products(id),
variant_id uuid references product_variants(id),

quantity int not null,
price_snapshot numeric
);

-- =========================================
-- INDEXES (PERFORMANCE)
-- =========================================

create index idx_products_category on products(category_id);
create index idx_orders_seller on orders(seller_id);
create index idx_orders_admin on orders(admin_id);
create index idx_cart_items_cart on cart_items(cart_id);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

alter table users enable row level security;
alter table orders enable row level security;
alter table carts enable row level security;

-- USERS POLICY
create policy "Users can read own data"
on users for select
using (auth.uid() = id);

-- ORDERS POLICY (SELLER)
create policy "Sellers can read own orders"
on orders for select
using (auth.uid() = seller_id);

-- ORDERS POLICY (ADMIN FULL ACCESS)
create policy "Admins can read all orders"
on orders for all
using (
exists (
select 1 from users
where users.id = auth.uid()
and users.role = 'admin'
)
);

-- =========================================
-- END OF SCHEMA
-- =========================================
