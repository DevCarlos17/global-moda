-- Add order window fields to containers
ALTER TABLE public.containers
  ADD COLUMN IF NOT EXISTS order_window_open  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS order_deadline     TIMESTAMPTZ;

-- Link orders to a container
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS container_id UUID REFERENCES public.containers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_container_idx ON public.orders(container_id);
