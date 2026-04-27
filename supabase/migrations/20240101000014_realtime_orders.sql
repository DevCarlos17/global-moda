-- Habilitar Realtime para la tabla orders
-- Permite que el admin reciba cambios instantáneos cuando un seller hace un pedido

-- FULL es necesario para que los eventos UPDATE incluyan los datos completos de la fila
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Agregar orders a la publicación de Realtime (solo si no está ya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END;
$$;
