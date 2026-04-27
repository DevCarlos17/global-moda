-- Habilitar Realtime para la tabla containers
-- Permite que sellers reciban el banner instantáneamente cuando el admin
-- abre/cierra la ventana de pedidos, sin necesidad de refrescar la página.

ALTER TABLE public.containers REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'containers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.containers;
  END IF;
END;
$$;
