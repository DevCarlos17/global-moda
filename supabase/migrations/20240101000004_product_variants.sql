-- ─── Product Variants ────────────────────────────────────────────────────────

CREATE TABLE public.product_variants (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label          TEXT          NOT NULL,
  attributes     JSONB         NOT NULL DEFAULT '{}',
  stock_quantity INT           NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  price_override NUMERIC(10,2),
  is_active      BOOLEAN       NOT NULL DEFAULT true,
  display_order  INT           NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX product_variants_product_id_idx ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon) can read variants
CREATE POLICY "variants_read" ON public.product_variants
  FOR SELECT USING (true);

-- Only admins can write
CREATE POLICY "variants_insert" ON public.product_variants
  FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "variants_update" ON public.product_variants
  FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "variants_delete" ON public.product_variants
  FOR DELETE USING (public.get_my_role() = 'admin');

-- ─── Add variant_id to cart_items ─────────────────────────────────────────────

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS variant_id UUID
    REFERENCES public.product_variants(id) ON DELETE SET NULL;
