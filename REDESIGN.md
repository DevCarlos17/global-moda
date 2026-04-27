# Rediseño Global Moda — Plan de Trabajo

## Objetivo
Migrar de la estética dorado/negro de lujo a un diseño **minimalista blanco/negro** limpio.
Inspiración: shadcn/ui — tablas limpias, tipografía clara, sin adornos innecesarios.

---

## Criterios de diseño

- Paleta: blanco, negro, grises neutros. Sin dorado.
- Fuente: Inter (ya instalada).
- Bordes: `border-gray-200` finos, sin sombras dramáticas.
- Cards: fondo blanco, borde sutil, sin gradientes.
- Tablas: estilo shadcn — header gris muy claro, filas con hover suave.
- Botón primario: negro sólido, hover gris oscuro.
- Badges: pills pequeños, colores semánticos suaves (verde, rojo, amarillo).
- Sin modo oscuro activo por defecto — solo modo claro limpio.

---

## Progreso

### Fase 0 — Base global (fundación del sistema)
- [ ] `index.css` — nuevos tokens de color y variables base
- [ ] `Button.tsx` — variantes en blanco/negro/outline gris
- [ ] `Card.tsx` — fondo blanco, borde gris-200
- [ ] `Input.tsx` & `Select.tsx` — estilo limpio, sin dorado
- [ ] `Badge.tsx` — pills semánticos sin dorado
- [ ] `DataTable.tsx` — estilo shadcn (header bg-gray-50, filas hover)
- [ ] `Modal.tsx` — fondo blanco, sin sombras de lujo
- [ ] `Pagination.tsx` — botones planos
- [ ] `Navbar.tsx` — fondo blanco, borde bottom gris
- [ ] `Sidebar.tsx` — blanco/gris, íconos oscuros, sin dorado

---

### Fase 1 — Autenticación
- [ ] `LoginPage` — centrado, limpio, sin gradientes dorados

---

### Fase 2 — Seller (vendedor)
- [ ] `CatalogPage` — grid de productos, cards minimalistas
- [ ] `ProductDetailPage` — layout limpio, sin adornos
- [ ] `CartPage` — tabla/lista limpia de ítems
- [ ] `ReviewOrderPage` — resumen de orden minimalista
- [ ] `OrdersPage` — tabla shadcn de pedidos
- [ ] `OrderDetailPage` — detalle de orden limpio
- [ ] `OrderSuccessPage` — confirmación minimalista

---

### Fase 3 — Admin
- [ ] `DashboardPage` — KPI cards simples, sin dorado
- [ ] `AdminOrdersPage` — tabla shadcn completa
- [ ] `ProductsPage` — tabla de productos con acciones
- [ ] `ProductFormPage` — formulario limpio
- [ ] `CategoriesPage` — tabla simple
- [ ] `SellersPage` — tabla de vendedores
- [ ] `SellerProfilePage` — perfil limpio
- [ ] `ContainersPage` — tabla de containers
- [ ] `ContainerDetailPage` — detalle con inventario
- [ ] `InventoryPage` — tabla de inventario

---

### Fase 4 — Público
- [ ] `PublicCatalogPage` — catálogo externo limpio
- [ ] `PublicProductDetailPage` — detalle producto público
- [ ] `PublicCheckoutPage` — checkout minimalista
- [ ] `PublicOrderSuccessPage` — confirmación pública

---

## Convención de checks

| Símbolo | Significado |
|---------|-------------|
| `[ ]`   | Pendiente |
| `[~]`   | En progreso |
| `[x]`   | Aprobado por el usuario |

---

## Notas de implementación

- Empezar siempre por la **Fase 0** — los demás cambios dependen de ella.
- Al terminar cada pantalla, el usuario la prueba en el browser.
- No pasar a la siguiente hasta recibir aprobación (`[x]`).
- Cambios de tema: eliminar referencias a `gold`, `luxury`, gradientes oscuros.
- Mantener toda la lógica existente — solo cambia la capa visual.
