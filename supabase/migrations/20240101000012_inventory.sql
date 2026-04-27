-- ─── container_stock_items ────────────────────────────────────────────────────
-- "Compra propia" del admin: productos que pidió para stock propio (no asignados a vendedores)

CREATE TABLE IF NOT EXISTS public.container_stock_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id    UUID NOT NULL REFERENCES public.containers(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  ordered_qty     INTEGER NOT NULL DEFAULT 0 CHECK (ordered_qty >= 0),
  received_qty    INTEGER CHECK (received_qty >= 0),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unicidad con variant_id nullable: dos índices parciales (patrón correcto en PG)
CREATE UNIQUE INDEX IF NOT EXISTS container_stock_items_with_variant_idx
  ON public.container_stock_items (container_id, product_id, variant_id)
  WHERE variant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS container_stock_items_no_variant_idx
  ON public.container_stock_items (container_id, product_id)
  WHERE variant_id IS NULL;

CREATE OR REPLACE TRIGGER container_stock_items_updated_at
  BEFORE UPDATE ON public.container_stock_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.container_stock_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'container_stock_items'
      AND policyname = 'Admin gestiona container_stock_items'
  ) THEN
    CREATE POLICY "Admin gestiona container_stock_items"
      ON public.container_stock_items FOR ALL
      USING (public.get_my_role() = 'admin');
  END IF;
END;
$$;

-- ─── RPC: adjust_product_stock ────────────────────────────────────────────────
-- Incrementa o decrementa stock atómicamente. delta negativo = decrementa.

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id  UUID,
  p_variant_id  UUID,
  p_delta       INTEGER
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_variant_id IS NOT NULL THEN
    UPDATE public.product_variants
      SET stock_quantity = stock_quantity + p_delta
      WHERE id = p_variant_id;
    IF (SELECT stock_quantity FROM public.product_variants WHERE id = p_variant_id) < 0 THEN
      RAISE EXCEPTION 'Stock insuficiente para la variante %', p_variant_id;
    END IF;
  ELSE
    UPDATE public.products
      SET stock_quantity = stock_quantity + p_delta,
          updated_at = NOW()
      WHERE id = p_product_id;
    IF (SELECT stock_quantity FROM public.products WHERE id = p_product_id) < 0 THEN
      RAISE EXCEPTION 'Stock insuficiente para el producto %', p_product_id;
    END IF;
  END IF;
END;
$$;

-- ─── RPC: receive_container_stock ────────────────────────────────────────────
-- Confirma recepción de mercancía: actualiza received_qty e incrementa stock.

CREATE OR REPLACE FUNCTION public.receive_container_stock(
  p_container_id  UUID,
  p_items         JSONB
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    UPDATE public.container_stock_items
      SET received_qty = (item->>'received_qty')::INTEGER,
          updated_at   = NOW()
      WHERE container_id = p_container_id
        AND product_id   = (item->>'product_id')::UUID
        AND COALESCE(variant_id, '00000000-0000-0000-0000-000000000000')
            = COALESCE(NULLIF(item->>'variant_id','')::UUID, '00000000-0000-0000-0000-000000000000');

    PERFORM public.adjust_product_stock(
      (item->>'product_id')::UUID,
      NULLIF(item->>'variant_id','')::UUID,
      (item->>'received_qty')::INTEGER
    );
  END LOOP;
END;
$$;

-- ─── RPC: set_product_stock ──────────────────────────────────────────────────
-- Ajuste manual: pisa el stock con un valor absoluto.

CREATE OR REPLACE FUNCTION public.set_product_stock(
  p_product_id  UUID,
  p_variant_id  UUID,
  p_quantity    INTEGER
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_quantity < 0 THEN
    RAISE EXCEPTION 'La cantidad no puede ser negativa';
  END IF;
  IF p_variant_id IS NOT NULL THEN
    UPDATE public.product_variants SET stock_quantity = p_quantity WHERE id = p_variant_id;
  ELSE
    UPDATE public.products SET stock_quantity = p_quantity, updated_at = NOW() WHERE id = p_product_id;
  END IF;
END;
$$;
