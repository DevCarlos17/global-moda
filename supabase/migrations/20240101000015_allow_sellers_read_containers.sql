-- Allow sellers to read containers where the order window is open.
-- This is required so that:
--   1. OrderWindowBanner shows sellers which container is accepting pre-orders.
--   2. orderService.getOpenContainer() can find the open container when a
--      seller creates a pre-order, so the order gets container_id set correctly.

CREATE POLICY "Sellers can read open containers"
  ON public.containers FOR SELECT
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'seller' AND order_window_open = true)
  );
