-- ============================================================
-- RESET DE DATOS DE PEDIDOS — solo para entornos de prueba
-- Limpia el ciclo completo: carrito → pedido → items → container
-- Los containers, productos, categorías y usuarios NO se tocan.
-- ============================================================

-- 1. Items de pedido (dependen de orders)
DELETE FROM public.order_items;

-- 2. Versiones de pedidos primero (tienen parent_order_id apuntando a otro order)
DELETE FROM public.orders WHERE parent_order_id IS NOT NULL;

-- 3. Pedidos raíz
DELETE FROM public.orders;

-- 4. Carritos de todos los vendedores
DELETE FROM public.cart_items;

-- ============================================================
-- Opcional: si también querés limpiar los containers y empezar
-- completamente desde cero, descomentá estas líneas:
--
-- DELETE FROM public.containers;
-- ============================================================
