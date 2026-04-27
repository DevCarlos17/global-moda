-- Store fulfillment intent per cart item so sellers explicitly choose stock vs pre-order
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS fulfillment_source TEXT
    CHECK (fulfillment_source IN ('stock', 'container'))
    DEFAULT 'stock';
