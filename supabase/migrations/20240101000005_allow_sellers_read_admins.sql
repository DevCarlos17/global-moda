-- ============================================================
-- Fix: vendedores necesitan leer perfiles de admin
-- para poder asignar administrador al crear un pedido.
-- ============================================================

create policy "Autenticados ven perfiles de admin"
  on public.profiles for select
  using (auth.uid() is not null and role = 'admin');
