# Global Moda Imports — UI Design System

## 1. Brand Identity

### Paleta de Colores
| Token | Hex | Uso |
|-------|-----|-----|
| `brand-black` | `#0A0A0A` | Fondos principales, texto primario |
| `brand-white` | `#FAFAFA` | Fondos claros, texto sobre oscuro |
| `brand-gold` | `#C8A951` | Acentos, botones primarios, bordes activos |
| `brand-gold-light` | `#E8D48B` | Hover de gold, fondos suaves |
| `brand-gold-dark` | `#A88B3A` | Active/pressed de gold |
| `gray-50` | `#F9FAFB` | Fondo de páginas claras |
| `gray-100` | `#F3F4F6` | Fondo de cards, inputs |
| `gray-200` | `#E5E7EB` | Bordes, separadores |
| `gray-300` | `#D1D5DB` | Bordes hover |
| `gray-400` | `#9CA3AF` | Texto secundario, placeholders |
| `gray-500` | `#6B7280` | Texto auxiliar |
| `gray-600` | `#4B5563` | Texto medio |
| `gray-700` | `#374151` | Texto fuerte |
| `gray-800` | `#1F2937` | Fondos oscuros |
| `gray-900` | `#111827` | Fondos muy oscuros |
| `success` | `#22C55E` | Estados positivos (confirmed, in_stock) |
| `warning` | `#F59E0B` | Estados de alerta (pending, low_stock) |
| `danger` | `#EF4444` | Estados negativos (rejected, cancelled) |
| `info` | `#3B82F6` | Estados informativos (updated) |

### Tipografía
- **Font family:** `'Inter', system-ui, -apple-system, sans-serif`
- **Headings:** Font weight 600-700, tracking tight
- **Body:** Font weight 400, tracking normal
- **Captions:** Font weight 400-500, text-sm, text-gray-500

### Escala tipográfica
| Nivel | Clase Tailwind | Uso |
|-------|---------------|-----|
| Display | `text-3xl font-bold tracking-tight` | Títulos de página |
| H1 | `text-2xl font-semibold tracking-tight` | Secciones principales |
| H2 | `text-xl font-semibold` | Subsecciones |
| H3 | `text-lg font-medium` | Cards, headers de grupo |
| Body | `text-base font-normal` | Contenido general |
| Small | `text-sm font-normal text-gray-500` | Labels, metadata |
| Caption | `text-xs font-medium uppercase tracking-wider` | Badges, tags |

### Espaciado y Bordes
- **Border radius:** `rounded-xl` (12px) para cards, `rounded-lg` (8px) para inputs/botones
- **Sombras:** `shadow-sm` por defecto, `shadow-md` en hover
- **Padding cards:** `p-4` en móvil, `p-6` en desktop
- **Gap entre cards:** `gap-4` en móvil, `gap-6` en desktop

### Iconos
- **Librería:** Lucide React
- **Tamaño default:** `size={20}` (w-5 h-5)
- **Tamaño navbar:** `size={24}` (w-6 h-6)
- **Color default:** `text-gray-500`, gold para acciones primarias

---

## 2. Componentes UI Base

### Button
```
Variantes:
┌─────────────────────────────────────────────────────┐
│  [  Primary  ]    bg-brand-gold text-black          │
│  [  Secondary ]   bg-gray-900 text-white            │
│  [  Outline  ]    border-gray-300 text-gray-700     │
│  [  Ghost    ]    transparent text-gray-600          │
│  [  Danger   ]    bg-red-500 text-white             │
└─────────────────────────────────────────────────────┘

Tamaños:
  sm: h-8  px-3  text-sm   rounded-lg
  md: h-10 px-4  text-sm   rounded-lg
  lg: h-12 px-6  text-base rounded-lg

Estados:
  hover:   opacity-90, shadow-sm
  active:  scale-[0.98]
  loading: spinner + texto deshabilitado
  disabled: opacity-50 cursor-not-allowed
```

### Input
```
┌──────────────────────────────────┐
│ Label                            │
│ ┌──────────────────────────────┐ │
│ │ Placeholder text...          │ │
│ └──────────────────────────────┘ │
│ Helper text o error              │
└──────────────────────────────────┘

Estilos:
  default:  border-gray-200 bg-gray-50 rounded-lg h-10
  focus:    border-brand-gold ring-1 ring-brand-gold/20
  error:    border-red-500 ring-1 ring-red-500/20
  label:    text-sm font-medium text-gray-700 mb-1.5
  error-msg: text-xs text-red-500 mt-1
```

### Badge
```
Variantes y usos:
  default:  bg-gray-100 text-gray-700
  success:  bg-green-50 text-green-700    → confirmed, completed, in_stock
  warning:  bg-amber-50 text-amber-700    → pending, low_stock
  danger:   bg-red-50 text-red-700        → rejected, cancelled, out_of_stock
  info:     bg-blue-50 text-blue-700      → updated
  gold:     bg-brand-gold/10 text-brand-gold-dark → import_on_demand

Estilo: text-xs font-medium px-2.5 py-0.5 rounded-full
```

### Card
```
┌─────────────────────────────────┐
│                                 │
│   Contenido                     │
│                                 │
└─────────────────────────────────┘

Estilo: bg-white rounded-xl border border-gray-100 shadow-sm
Hover (clickable): shadow-md transition-shadow
Padding: p-4 (mobile) p-6 (desktop)
```

### Modal
```
┌──────────────────────────────────────┐
│  ╔════════════════════════════════╗   │
│  ║  Title                    [X] ║   │
│  ╠════════════════════════════════╣   │
│  ║                               ║   │
│  ║  Content                      ║   │
│  ║                               ║   │
│  ╠════════════════════════════════╣   │
│  ║         [Cancel] [Confirm]    ║   │
│  ╚════════════════════════════════╝   │
│          (backdrop oscuro)           │
└──────────────────────────────────────┘

Backdrop: bg-black/50 backdrop-blur-sm
Modal: bg-white rounded-2xl shadow-2xl max-w-md mx-4
Tamaños: sm(max-w-sm), md(max-w-md), lg(max-w-lg)
```

---

## 3. Pantallas — Seller (Vendedor)

### 3.1 Login Page
```
Estilo: Elegante, fondo oscuro

┌─────────────────────────────────────┐
│                                     │
│          ┌─────────────┐            │
│          │   GM LOGO   │            │
│          │ Global Moda │            │
│          │   Imports   │            │
│          └─────────────┘            │
│                                     │
│    ┌───────────────────────────┐    │
│    │                           │    │
│    │  Email                    │    │
│    │  ┌─────────────────────┐  │    │
│    │  │                     │  │    │
│    │  └─────────────────────┘  │    │
│    │                           │    │
│    │  Contraseña               │    │
│    │  ┌─────────────────────┐  │    │
│    │  │                     │  │    │
│    │  └─────────────────────┘  │    │
│    │                           │    │
│    │  [    Iniciar Sesión    ] │    │
│    │      (botón gold)        │    │
│    │                           │    │
│    └───────────────────────────┘    │
│                                     │
│        fondo: brand-black           │
│        card: bg-gray-900/80         │
│        bordes: brand-gold/20        │
└─────────────────────────────────────┘
```

### 3.2 Catalog Page (Móvil — Vista Principal)
```
┌─────────────────────────────────────┐
│  GM        🔍         🛒(3)   👤   │  ← Navbar
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🔍 Buscar productos...       │  │  ← Search bar
│  └───────────────────────────────┘  │
│                                     │
│  Categorías: [Todas] [Cat1] [Cat2]  │  ← Chips horizontales scroll
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │                               │  │
│  │        PRODUCT IMAGE          │  │  ← Imagen grande, aspect-[4/3]
│  │                               │  │
│  │                               │  │
│  ├───────────────────────────────┤  │
│  │  Product Name                 │  │
│  │  Categoría          [Badge]   │  │  ← Badge de stock
│  │  $Price o "Consultar"         │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │        PRODUCT IMAGE          │  │
│  │                               │  │
│  ├───────────────────────────────┤  │
│  │  Product Name                 │  │
│  │  Categoría          [Badge]   │  │
│  │  $Price                       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ... scroll infinito o paginación   │
└─────────────────────────────────────┘

Desktop (3 columnas):
┌─────────────────────────────────────────────────────────────┐
│  GM Logo    🔍 Buscar...              🛒(3)    👤 Nombre   │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Categorías│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│          │  │  IMAGE   │ │  IMAGE   │ │  IMAGE   │       │
│ > Todos  │  │          │ │          │ │          │       │
│   Cat 1  │  ├──────────┤ ├──────────┤ ├──────────┤       │
│   Cat 2  │  │ Name     │ │ Name     │ │ Name     │       │
│   Cat 3  │  │ $Price   │ │ $Price   │ │ $Price   │       │
│     Sub1 │  └──────────┘ └──────────┘ └──────────┘       │
│     Sub2 │                                                  │
│   Cat 4  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│          │  │  IMAGE   │ │  IMAGE   │ │  IMAGE   │       │
└──────────┴──┴──────────┘─┴──────────┘─┴──────────┘───────┘
```

### 3.3 Product Detail Page (Móvil)
```
┌─────────────────────────────────────┐
│  ← Volver              🛒(3)       │  ← Navbar con back button
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │                               │  │
│  │       PRODUCT IMAGE           │  │  ← Carrusel de imágenes
│  │       (swipeable)             │  │
│  │                               │  │
│  │       • ○ ○ ○                 │  │  ← Indicadores de punto
│  └───────────────────────────────┘  │
│                                     │
│  Categoría                          │
│  Product Name                       │  ← text-2xl font-bold
│                                     │
│  $Price                             │  ← text-xl text-brand-gold font-semibold
│  o "Precio a consultar"             │
│                                     │
│  ─────────────────────────────────  │  ← Separador
│                                     │
│  [In Stock]                         │  ← Badge de stock
│                                     │
│  Descripción del producto que       │
│  puede tener varias líneas y ser    │
│  bastante detallada...              │
│                                     │
│  "Speech/Argumento de venta que     │  ← Texto en itálica con
│   el vendedor puede usar"           │     borde gold izquierdo
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Tallas disponibles:                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ S  │ │ M  │ │ L  │ │ XL │      │  ← Chips seleccionables
│  └────┘ └────┘ └────┘ └────┘      │     Gold = seleccionado
│                                     │
│  Cantidad:                          │
│  [ - ]  1  [ + ]                    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    Agregar al Carrito  🛒     │  │  ← Botón gold, full-width, sticky
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3.4 Cart Drawer (Slide desde derecha)
```
Cerrado: solo icono 🛒 en navbar
Abierto:

     ┌──────────────────────────────┐
     │  Carrito (3)            [X]  │  ← Header con close
     ├──────────────────────────────┤
     │                              │
     │  ┌──────┬───────────────┐   │
     │  │      │ Product Name  │   │
     │  │ IMG  │ Talla: M      │   │
     │  │      │ $Price        │   │
     │  │      │ [-] 2 [+] 🗑  │   │
     │  └──────┴───────────────┘   │
     │                              │
     │  ┌──────┬───────────────┐   │
     │  │      │ Product Name  │   │
     │  │ IMG  │ Talla: L      │   │
     │  │      │ Consultar     │   │
     │  │      │ [-] 1 [+] 🗑  │   │
     │  └──────┴───────────────┘   │
     │                              │
     │  ┌──────┬───────────────┐   │
     │  │      │ Product Name  │   │
     │  │ IMG  │ Sin talla     │   │
     │  │      │ $Price        │   │
     │  │      │ [-] 1 [+] 🗑  │   │
     │  └──────┴───────────────┘   │
     │                              │
     ├──────────────────────────────┤
     │  Total: $XXX.XX              │  ← O "Precios a confirmar"
     │  3 productos                 │
     │                              │
     │  [  Revisar Pedido  →  ]     │  ← Botón gold
     │  [ Vaciar carrito ]          │  ← Botón ghost
     └──────────────────────────────┘

Ancho: w-full (móvil) / w-96 (desktop)
Backdrop: bg-black/30
Transición: slide-in-right 200ms ease-out
```

### 3.5 Review Order Page (Checkout)
```
┌─────────────────────────────────────┐
│  ← Volver al carrito               │
├─────────────────────────────────────┤
│                                     │
│  Revisar Pedido                     │  ← H1
│                                     │
│  ── Resumen de productos ────────   │
│                                     │
│  Product 1 (M) x2      $XX.XX      │
│  Product 2 (L) x1      Consultar   │
│  Product 3     x1      $XX.XX      │
│  ─────────────────────────────────  │
│  Total:                 $XXX.XX     │
│                                     │
│  ── Información de la tienda ────   │
│                                     │
│  Nombre de la tienda *              │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Dueño de la tienda                 │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Teléfono                           │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Dirección                          │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Ciudad                             │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ── Asignar administrador ───────   │
│                                     │
│  Seleccionar admin *                │
│  ┌─────────────────────────────┐    │
│  │ ▼ Seleccionar...            │    │
│  └─────────────────────────────┘    │
│                                     │
│  Notas del pedido                   │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     Confirmar Pedido  ✓       │  │  ← Botón gold, full-width
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 3.6 Order Success Page
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ✓                      │  ← Checkmark grande, animado
│         (círculo gold)              │     gold sobre fondo blanco
│                                     │
│     Pedido enviado con éxito        │  ← text-2xl font-bold
│                                     │
│     GM-A1B2C3D4-V1                  │  ← text-lg text-gray-500
│                                     │
│     Tu pedido ha sido enviado       │
│     al administrador asignado.      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Ver mis pedidos          │  │  ← Botón primary gold
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    Volver al catálogo         │  │  ← Botón outline
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 3.7 My Orders Page (Historial)
```
┌─────────────────────────────────────┐
│  GM        Mis Pedidos      🛒 👤  │
├─────────────────────────────────────┤
│                                     │
│  [Todos] [Pendientes] [Confirmados] │  ← Filter tabs
│  [Completados]                      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  GM-A1B2C3D4  V2    [Updated]│  │  ← Order card
│  │  Tienda: "Mi Tienda"         │  │
│  │  3 productos                  │  │
│  │  23 Abr 2026, 14:30          │  │
│  │                          →    │  │  ← Chevron para ver detalle
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  GM-E5F6G7H8  V1   [Pending] │  │
│  │  Tienda: "Fashion Store"     │  │
│  │  5 productos                  │  │
│  │  22 Abr 2026, 10:15          │  │
│  │                          →    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  GM-I9J0K1L2  V1 [Confirmed] │  │
│  │  Tienda: "Style Hub"         │  │
│  │  2 productos                  │  │
│  │  20 Abr 2026, 09:00          │  │
│  │                          →    │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 3.8 Order Detail Page
```
┌─────────────────────────────────────┐
│  ← Volver                          │
├─────────────────────────────────────┤
│                                     │
│  Pedido GM-A1B2C3D4                 │
│  Versión 2          [Updated]       │
│                                     │
│  ── Información de la tienda ────   │
│  Tienda: Mi Tienda                  │
│  Dueño: Juan Pérez                  │
│  Tel: +55 11 99999-9999             │
│  Dir: Rua Augusta 123               │
│  Ciudad: São Paulo                  │
│                                     │
│  ── Productos ───────────────────   │
│                                     │
│  ┌──────┬────────────────────┐      │
│  │ IMG  │ Product 1          │      │
│  │      │ Talla: M  x2       │      │
│  │      │ $XX.XX             │      │
│  └──────┴────────────────────┘      │
│  ┌──────┬────────────────────┐      │
│  │ IMG  │ Product 2          │      │
│  │      │ Talla: L  x1       │      │
│  │      │ $XX.XX             │      │
│  └──────┴────────────────────┘      │
│                                     │
│  Total: $XXX.XX                     │
│                                     │
│  ── Notas ───────────────────────   │
│  "Entregar antes de las 15h"        │
│                                     │
│  ── Historial de versiones ──────   │
│  ○ V2 - Actualizado - 23 Abr       │  ← Timeline
│  │  Cambió cantidades               │
│  ● V1 - Creado - 22 Abr            │
│                                     │
│  ┌─────────────┐ ┌──────────────┐   │
│  │ Editar pedido│ │  Cancelar   │   │  ← Acciones condicionales
│  └─────────────┘ └──────────────┘   │
│  (gold outline)   (danger outline)  │
└─────────────────────────────────────┘
```

---

## 4. Pantallas — Admin

### 4.1 Admin Dashboard
```
┌──────────┬──────────────────────────────────────────────────┐
│  GM      │  Dashboard                      👤 Admin Name   │
│  LOGO    │                                                  │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ ■ Dashboard│  ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│   Pedidos│  │ Pendientes│ │ Productos │ │ Vendedores│      │
│   Products│  │   12      │ │   48      │ │    6      │     │
│   Categorías│ │ 🟡       │ │ 📦       │ │ 👥       │     │
│   Vendedores│ └───────────┘ └───────────┘ └───────────┘    │
│          │                                                  │
│          │  ┌───────────┐ ┌───────────┐                    │
│          │  │ Completados│ │ Total $   │                    │
│          │  │   89      │ │  $XXX.XX  │                    │
│          │  │ ✅        │ │ 💰        │                    │
│          │  └───────────┘ └───────────┘                    │
│          │                                                  │
│          │  ── Pedidos recientes pendientes ─────────       │
│          │                                                  │
│          │  │ # │ Vendedor│ Tienda    │ Items │ Estado │    │
│          │  │───│─────────│───────────│───────│────────│    │
│          │  │ 1 │ Carlos  │ Mi Tienda │   3   │Pending │    │
│          │  │ 2 │ Ana     │ Fashion   │   5   │Updated │    │
│          │  │ 3 │ Pedro   │ Style Hub │   2   │Pending │    │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘

Sidebar:
  bg-gray-900 text-white w-64
  Logo en top
  Links con iconos lucide-react
  Active: bg-brand-gold/10 text-brand-gold border-l-2 border-brand-gold
  Hover: bg-white/5

Stats cards:
  bg-white rounded-xl p-5 border border-gray-100
  Número grande (text-3xl font-bold)
  Label debajo (text-sm text-gray-500)
  Icono en esquina superior derecha (text-gray-300)
```

### 4.2 Admin Orders Page
```
┌──────────┬──────────────────────────────────────────────────┐
│  GM      │  Pedidos                        👤 Admin Name   │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ Dashboard│  [Todos] [Pending] [Updated] [Confirmed]        │
│ ■ Pedidos│  [Rejected] [Completed]                         │
│ Products │                                                  │
│ Categorías│ ┌──────────────────────────────────────────┐    │
│ Vendedores│ │  # Orden   │ Vendedor│ Tienda │ V │Estado│    │
│          │  │────────────│─────────│────────│───│──────│    │
│          │  │GM-A1B2C3D4│ Carlos  │Mi Tien…│ 2 │Updat…│    │
│          │  │            │         │        │   │      │    │
│          │  │  [Confirmar] [Rechazar]       │   │      │    │
│          │  │────────────│─────────│────────│───│──────│    │
│          │  │GM-E5F6G7H8│ Ana     │Fashion │ 1 │Pendi…│    │
│          │  │            │         │        │   │      │    │
│          │  │  [Confirmar] [Rechazar]       │   │      │    │
│          │  │────────────│─────────│────────│───│──────│    │
│          │  │GM-I9J0K1L2│ Pedro   │Style H…│ 1 │Confi…│    │
│          │  │            │         │        │   │      │    │
│          │  │  [Completar]                  │   │      │    │
│          │  └──────────────────────────────────────────┘    │
│          │                                                  │
│          │  Mostrando 1-10 de 45      [←] [1] [2] [3] [→] │
└──────────┴──────────────────────────────────────────────────┘

Tabla:
  bg-white rounded-xl overflow-hidden
  Header: bg-gray-50 text-xs font-medium text-gray-500 uppercase
  Rows: border-b border-gray-100, hover:bg-gray-50
  Acciones: botones pequeños inline
  Estado: Badge component

Botones de acción según estado:
  pending  → [Confirmar (green)] [Rechazar (red)]
  updated  → [Confirmar] [Rechazar]
  confirmed → [Completar (gold)]
  rejected/cancelled/completed → sin acciones
```

### 4.3 Admin Products Page
```
┌──────────┬──────────────────────────────────────────────────┐
│  GM      │  Productos                      👤 Admin Name   │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ Dashboard│  🔍 Buscar...          [+ Nuevo Producto]        │
│ Pedidos  │                                                  │
│ ■ Products│ ┌──────────────────────────────────────────┐    │
│ Categorías│ │ Img │ Nombre    │ Categoría│Stock │  $   │    │
│ Vendedores│ │─────│───────────│──────────│──────│──────│    │
│          │  │ 🖼  │ Producto 1│ Cat A    │ ✅   │$XX.XX│    │
│          │  │     │           │          │      │ [✏️🗑]│    │
│          │  │─────│───────────│──────────│──────│──────│    │
│          │  │ 🖼  │ Producto 2│ Cat B    │ 🟡   │Cons. │    │
│          │  │     │           │          │      │ [✏️🗑]│    │
│          │  └──────────────────────────────────────────┘    │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 4.4 Admin Product Form (Create/Edit)
```
┌──────────┬──────────────────────────────────────────────────┐
│  GM      │  Nuevo Producto / Editar Producto                │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ ...      │  ── Información básica ──────────────────        │
│          │                                                  │
│          │  Nombre *                                        │
│          │  ┌──────────────────────────────────────┐        │
│          │  │                                      │        │
│          │  └──────────────────────────────────────┘        │
│          │                                                  │
│          │  Descripción                                     │
│          │  ┌──────────────────────────────────────┐        │
│          │  │                                      │        │
│          │  │                                      │        │
│          │  └──────────────────────────────────────┘        │
│          │                                                  │
│          │  Speech / Argumento de venta                     │
│          │  ┌──────────────────────────────────────┐        │
│          │  │                                      │        │
│          │  └──────────────────────────────────────┘        │
│          │                                                  │
│          │  Precio (dejar vacío si no aplica)               │
│          │  ┌──────────────────────────────────────┐        │
│          │  │                                      │        │
│          │  └──────────────────────────────────────┘        │
│          │                                                  │
│          │  Categoría           Estado de stock             │
│          │  ┌────────────────┐  ┌────────────────┐          │
│          │  │ ▼ Seleccionar  │  │ ▼ Importar a   │          │
│          │  └────────────────┘  │   demanda      │          │
│          │                      └────────────────┘          │
│          │                                                  │
│          │  ── Imágenes ─────────────────────────           │
│          │                                                  │
│          │  ┌──────┐ ┌──────┐ ┌────────────────┐           │
│          │  │ IMG  │ │ IMG  │ │  + Agregar     │           │
│          │  │  [x] │ │  [x] │ │    imagen      │           │
│          │  └──────┘ └──────┘ └────────────────┘           │
│          │  (arrastra para reordenar)                       │
│          │                                                  │
│          │  ── Tallas / Variantes ───────────────           │
│          │                                                  │
│          │  │ Talla │ Precio (opc.) │         │             │
│          │  │───────│───────────────│─────────│             │
│          │  │  S    │  $XX.XX       │  [🗑]  │             │
│          │  │  M    │  $XX.XX       │  [🗑]  │             │
│          │  │  L    │  —            │  [🗑]  │             │
│          │                                                  │
│          │  [+ Agregar talla]                               │
│          │                                                  │
│          │  ┌──────────────┐  ┌──────────────┐              │
│          │  │   Cancelar   │  │   Guardar    │              │
│          │  └──────────────┘  └──────────────┘              │
│          │  (outline)          (gold primary)               │
└──────────┴──────────────────────────────────────────────────┘
```

### 4.5 Admin Categories Page
```
┌──────────┬──────────────────────────────────────────────────┐
│  GM      │  Categorías                     👤 Admin Name   │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ ...      │  [+ Nueva Categoría]                             │
│ ■ Categorías│                                               │
│ ...      │  ┌─────────────────────────────────────────┐     │
│          │  │ 📁 Ropa                    [✏️] [🗑] [+]│     │
│          │  │   ├─ 📁 Vestidos           [✏️] [🗑] [+]│     │
│          │  │   ├─ 📁 Faldas             [✏️] [🗑] [+]│     │
│          │  │   └─ 📁 Blusas             [✏️] [🗑] [+]│     │
│          │  │ 📁 Accesorios              [✏️] [🗑] [+]│     │
│          │  │   ├─ 📁 Bolsos             [✏️] [🗑] [+]│     │
│          │  │   └─ 📁 Joyería            [✏️] [🗑] [+]│     │
│          │  │ 📁 Calzado                 [✏️] [🗑] [+]│     │
│          │  └─────────────────────────────────────────┘     │
│          │                                                  │
│          │  [+] = Agregar subcategoría                      │
│          │  [✏️] = Editar nombre (inline o modal)           │
│          │  [🗑] = Eliminar (con confirmación)              │
└──────────┴──────────────────────────────────────────────────┘
```

### 4.6 Admin Sellers Page
```
┌──────────┬──────────────────────────────────────────────────┐
│  GM      │  Vendedores                     👤 Admin Name   │
├──────────┼──────────────────────────────────────────────────┤
│          │                                                  │
│ ...      │  [+ Nuevo Usuario]                               │
│ ■ Vendedores│                                               │
│ ...      │  ┌──────────────────────────────────────────┐    │
│          │  │ Nombre  │ Email       │ Tel    │ Rol     │    │
│          │  │─────────│─────────────│────────│─────────│    │
│          │  │ Carlos  │ c@mail.com  │ +55... │ Seller  │    │
│          │  │ Ana     │ a@mail.com  │ +55... │ Seller  │    │
│          │  │ Admin 2 │ ad@mail.com │ +55... │ Admin   │    │
│          │  └──────────────────────────────────────────┘    │
│          │                                                  │
│          │  Modal "Nuevo Usuario":                          │
│          │  ┌──────────────────────────────┐                │
│          │  │ Nombre *                     │                │
│          │  │ [                           ]│                │
│          │  │ Email *                      │                │
│          │  │ [                           ]│                │
│          │  │ Teléfono                     │                │
│          │  │ [                           ]│                │
│          │  │ Contraseña *                 │                │
│          │  │ [                           ]│                │
│          │  │ Rol *                        │                │
│          │  │ [▼ Seller / Admin           ]│                │
│          │  │                              │                │
│          │  │ [Cancelar]  [Crear Usuario]  │                │
│          │  └──────────────────────────────┘                │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 5. Navegación del Seller (Móvil)

### Navbar Superior (siempre visible)
```
┌─────────────────────────────────────┐
│  GM         [🔍]      🛒(3)   👤   │
└─────────────────────────────────────┘

GM = Logo/texto "GM" en gold, click → /catalog
🔍 = Toggle search bar (solo en catalog page)
🛒 = Abre Cart Drawer, badge con count (gold circle)
👤 = Dropdown: "Mis Pedidos", "Cerrar Sesión"

Estilo:
  bg-white border-b border-gray-100
  h-16 px-4
  Sticky top-0 z-50
```

### Dropdown de usuario
```
                              ┌────────────────┐
                              │ Carlos López    │
                              │ carlos@mail.com │
                              ├────────────────┤
                              │ 📋 Mis Pedidos │
                              │ 🚪 Cerrar Sesión│
                              └────────────────┘
Estilo: bg-white rounded-xl shadow-lg border border-gray-100 py-1
```

---

## 6. Estados de Componentes

### Loading States
```
Skeleton Loading (para cards de producto):
┌───────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Shimmer animation
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├───────────────────────────────┤
│ ░░░░░░░░░░░░                 │
│ ░░░░░░░                      │
│ ░░░░░░░░░                    │
└───────────────────────────────┘

Colores: bg-gray-200 animate-pulse rounded
```

### Empty States
```
┌───────────────────────────────┐
│                               │
│         📦 (icono grande)     │
│                               │
│    No hay productos           │  ← text-lg font-medium
│    que mostrar                │
│                               │
│    Intenta con otra búsqueda  │  ← text-sm text-gray-500
│    o categoría                │
│                               │
│    [Ver todo el catálogo]     │  ← Botón outline
│                               │
└───────────────────────────────┘
```

### Error States
```
┌───────────────────────────────┐
│                               │
│         ⚠️ (icono grande)     │
│                               │
│    Error al cargar datos      │  ← text-lg font-medium
│                               │
│    Hubo un problema al        │  ← text-sm text-gray-500
│    conectar con el servidor   │
│                               │
│    [  Reintentar  ]           │  ← Botón primary
│                               │
└───────────────────────────────┘
```

---

## 7. Responsive Breakpoints

| Breakpoint | Tailwind | Uso |
|------------|----------|-----|
| Mobile | `< 640px` (default) | Catálogo 1 col, drawer full, sin sidebar |
| Tablet | `sm: 640px` | Catálogo 2 cols, drawer w-96 |
| Desktop | `md: 768px` | Catálogo 2 cols, sidebar aparece |
| Large | `lg: 1024px` | Catálogo 3 cols, sidebar fija |
| XL | `xl: 1280px` | Catálogo 4 cols, máximo ancho |

---

## 8. Animaciones y Transiciones

| Elemento | Transición |
|----------|------------|
| Botones hover | `transition-all duration-150` |
| Cards hover | `transition-shadow duration-200` |
| Cart Drawer | `transform transition-transform duration-200 ease-out` |
| Modal | `transition-opacity duration-150` + scale |
| Page transitions | No (simple y rápido) |
| Skeleton pulse | `animate-pulse` (built-in Tailwind) |
| Toast (Sonner) | Default Sonner animations |
| Badge aparición | `transition-all duration-200` |

---

## 9. Orden Status Colors Map

| Status | Badge | Color | Icono |
|--------|-------|-------|-------|
| `pending` | Pendiente | `bg-amber-50 text-amber-700` | Clock |
| `updated` | Actualizado | `bg-blue-50 text-blue-700` | RefreshCw |
| `confirmed` | Confirmado | `bg-green-50 text-green-700` | CheckCircle |
| `rejected` | Rechazado | `bg-red-50 text-red-700` | XCircle |
| `cancelled` | Cancelado | `bg-gray-100 text-gray-500` | Ban |
| `completed` | Completado | `bg-green-50 text-green-700` | CheckCircle2 |

## 10. Stock Status Colors Map

| Status | Label | Color |
|--------|-------|-------|
| `in_stock` | En Stock | `bg-green-50 text-green-700` |
| `low_stock` | Poco Stock | `bg-amber-50 text-amber-700` |
| `out_of_stock` | Sin Stock | `bg-red-50 text-red-700` |
| `import_on_demand` | Importar a Demanda | `bg-brand-gold/10 text-brand-gold-dark` |
