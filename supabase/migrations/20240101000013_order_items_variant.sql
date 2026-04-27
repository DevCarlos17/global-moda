-- Agrega variant_id a order_items para trackear qué variante pidió cada vendedor
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID
    REFERENCES public.product_variants(id) ON DELETE SET NULL;
