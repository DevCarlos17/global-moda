-- ============================================================
-- Customer orders — pedidos de clientes sin cuenta
-- ============================================================

-- 1. Extender tabla orders
alter table public.orders
  alter column seller_id drop not null,
  add column if not exists order_type text not null default 'seller'
    check (order_type in ('seller', 'customer')),
  add column if not exists customer_name  text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text;

create index if not exists orders_type_idx on public.orders(order_type);

-- 2. Permitir al rol anon leer productos y categorías (catálogo público)
create policy "Público lee productos activos"
  on public.products for select
  to anon
  using (is_active = true);

create policy "Público lee categorías"
  on public.categories for select
  to anon
  using (true);

-- 3. Función security definer para crear órdenes de clientes sin RLS
--    El rol anon llama a esta función vía supabase.rpc(...)
create or replace function public.create_customer_order(
  p_customer_name  text,
  p_customer_phone text,
  p_customer_email text,
  p_address        text,
  p_notes          text,
  p_total_amount   numeric,
  p_items          jsonb    -- [{ product_id, quantity, unit_price, subtotal }]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id     uuid;
  v_order_number text;
begin
  -- Validaciones básicas
  if p_customer_name  is null or trim(p_customer_name)  = '' then
    raise exception 'customer_name es requerido';
  end if;
  if p_customer_phone is null or trim(p_customer_phone) = '' then
    raise exception 'customer_phone es requerido';
  end if;
  if p_total_amount < 0 then
    raise exception 'total_amount no puede ser negativo';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido debe tener al menos un producto';
  end if;

  -- Generar número de orden: GMC-MMDD-XXXX
  v_order_number := 'GMC-' ||
    to_char(now(), 'MMDD') || '-' ||
    lpad((floor(random() * 9000 + 1000))::text, 4, '0');

  -- Insertar orden
  insert into public.orders (
    order_number, seller_id, admin_id, status, version,
    order_type, store_name, store_address, store_contact,
    notes, total_amount,
    customer_name, customer_phone, customer_email
  ) values (
    v_order_number, null, null, 'pending', 1,
    'customer', p_customer_name, p_address, p_customer_phone,
    p_notes, p_total_amount,
    p_customer_name, p_customer_phone, p_customer_email
  )
  returning id into v_order_id;

  -- Insertar items
  insert into public.order_items (order_id, product_id, quantity, unit_price, subtotal)
  select
    v_order_id,
    (item->>'product_id')::uuid,
    (item->>'quantity')::integer,
    (item->>'unit_price')::numeric,
    (item->>'subtotal')::numeric
  from jsonb_array_elements(p_items) as item;

  return v_order_id;
end;
$$;

-- Dar permiso de ejecución al rol anon
grant execute on function public.create_customer_order(
  text, text, text, text, text, numeric, jsonb
) to anon;
