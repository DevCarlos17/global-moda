-- Extend order status constraint to include import-related states
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'draft','pending','confirmed','processing',
    'awaiting_container','in_transit','in_customs',
    'in_warehouse','shipped','delivered','cancelled'
  ));
