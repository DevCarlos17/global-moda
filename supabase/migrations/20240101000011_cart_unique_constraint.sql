-- Drop old constraint that only covered (user_id, product_id) and didn't
-- account for variant_id or fulfillment_source. Two separate lines for the
-- same product (stock vs pre-order, or different variants) are valid.
ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- New unique index: one cart line per (user, product, variant, source).
-- COALESCE on variant_id is required because PostgreSQL treats NULL != NULL
-- in unique indexes, which would allow duplicate no-variant lines.
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_line
  ON public.cart_items (
    user_id,
    product_id,
    COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'),
    fulfillment_source
  );
