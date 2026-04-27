-- Per-item fulfillment source: admin marks each item as 'stock' or 'container'
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS fulfillment_source TEXT
    CHECK (fulfillment_source IN ('stock', 'container'));

-- Sellers can read containers linked to their own orders
CREATE POLICY "Sellers ven containers de sus pedidos"
  ON public.containers FOR SELECT
  USING (
    id IN (
      SELECT container_id FROM public.orders
      WHERE seller_id = auth.uid()
        AND container_id IS NOT NULL
    )
  );
