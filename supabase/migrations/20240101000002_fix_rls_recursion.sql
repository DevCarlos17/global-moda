-- ============================================================
-- Fix: RLS infinite recursion en policies que consultan profiles
-- ============================================================
-- Las policies que hacen exists(select from profiles) dentro de
-- una policy de profiles causan recursión infinita.
-- Solución: función security definer que lee el role sin RLS.
-- ============================================================

create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Profiles
drop policy if exists "Admin ve todos los perfiles"  on public.profiles;
drop policy if exists "Admin actualiza perfiles"      on public.profiles;

create policy "Admin ve todos los perfiles"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

create policy "Admin actualiza perfiles"
  on public.profiles for update
  using (public.get_my_role() = 'admin');

-- Categories
drop policy if exists "Admin gestiona categorías" on public.categories;

create policy "Admin gestiona categorías"
  on public.categories for all
  using (public.get_my_role() = 'admin');

-- Products
drop policy if exists "Admin lee todos los productos" on public.products;
drop policy if exists "Admin gestiona productos"      on public.products;

create policy "Admin lee todos los productos"
  on public.products for select
  using (public.get_my_role() = 'admin');

create policy "Admin gestiona productos"
  on public.products for all
  using (public.get_my_role() = 'admin');

-- Orders
drop policy if exists "Admin gestiona órdenes" on public.orders;

create policy "Admin gestiona órdenes"
  on public.orders for all
  using (public.get_my_role() = 'admin');

-- Order items
drop policy if exists "Admin gestiona order_items" on public.order_items;

create policy "Admin gestiona order_items"
  on public.order_items for all
  using (public.get_my_role() = 'admin');
