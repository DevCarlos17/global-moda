-- ============================================================
-- Global Moda Imports — Schema inicial
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extiende auth.users de Supabase)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null default 'seller' check (role in ('seller', 'admin')),
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Trigger: crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'seller')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: actualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS Policies — profiles
create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin ve todos los perfiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admin actualiza perfiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  parent_id     uuid references public.categories(id) on delete set null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Todos los usuarios autenticados pueden leer categorías
create policy "Autenticados leen categorías"
  on public.categories for select
  using (auth.uid() is not null);

create policy "Admin gestiona categorías"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id             uuid primary key default uuid_generate_v4(),
  sku            text not null unique,
  name           text not null,
  description    text,
  price          numeric(12, 2) not null check (price >= 0),
  category_id    uuid references public.categories(id) on delete set null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  images         text[] not null default '{}',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_is_active_idx on public.products(is_active);

alter table public.products enable row level security;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Vendedores y admins leen productos activos
create policy "Autenticados leen productos activos"
  on public.products for select
  using (auth.uid() is not null and is_active = true);

-- Admin lee todos (incluyendo inactivos)
create policy "Admin lee todos los productos"
  on public.products for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admin gestiona productos"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- CART ITEMS
-- ============================================================
create table public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index cart_items_user_idx on public.cart_items(user_id);

alter table public.cart_items enable row level security;

create policy "Usuario gestiona su carrito"
  on public.cart_items for all
  using (auth.uid() = user_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id              uuid primary key default uuid_generate_v4(),
  order_number    text not null unique,
  seller_id       uuid not null references public.profiles(id),
  admin_id        uuid references public.profiles(id),
  status          text not null default 'pending'
                    check (status in ('draft','pending','confirmed','processing','shipped','delivered','cancelled')),
  version         integer not null default 1,
  parent_order_id uuid references public.orders(id) on delete set null,
  store_name      text not null,
  store_address   text,
  store_contact   text,
  notes           text,
  total_amount    numeric(12, 2) not null default 0 check (total_amount >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index orders_seller_idx  on public.orders(seller_id);
create index orders_admin_idx   on public.orders(admin_id);
create index orders_status_idx  on public.orders(status);
create index orders_parent_idx  on public.orders(parent_order_id);

alter table public.orders enable row level security;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Vendedor ve sus propias órdenes
create policy "Vendedor ve sus órdenes"
  on public.orders for select
  using (auth.uid() = seller_id);

-- Vendedor crea órdenes propias
create policy "Vendedor crea órdenes"
  on public.orders for insert
  with check (auth.uid() = seller_id);

-- Vendedor cancela sus órdenes pendientes
create policy "Vendedor cancela sus órdenes"
  on public.orders for update
  using (auth.uid() = seller_id and status in ('pending', 'draft'));

-- Admin gestiona todas las órdenes
create policy "Admin gestiona órdenes"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table public.order_items (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity   integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  subtotal   numeric(12, 2) not null check (subtotal >= 0)
);

create index order_items_order_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

-- Acceso a order_items siguiendo el mismo criterio que la orden padre
create policy "Vendedor ve items de sus órdenes"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.seller_id = auth.uid()
    )
  );

create policy "Vendedor inserta items en sus órdenes"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.seller_id = auth.uid()
    )
  );

create policy "Admin gestiona order_items"
  on public.order_items for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
