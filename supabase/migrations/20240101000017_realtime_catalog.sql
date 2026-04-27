-- Habilitar Realtime para tablas del catálogo
-- Permite que sellers vean cambios de productos, variantes y categorías
-- instantáneamente sin necesidad de refrescar la página.

ALTER TABLE public.products          REPLICA IDENTITY FULL;
ALTER TABLE public.product_variants  REPLICA IDENTITY FULL;
ALTER TABLE public.categories        REPLICA IDENTITY FULL;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['products', 'product_variants', 'categories']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END;
$$;
