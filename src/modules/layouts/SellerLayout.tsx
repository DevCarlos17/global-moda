import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/navigation/Navbar'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { OrderWindowBanner } from '@/features/containers/components/OrderWindowBanner'
import { useCart } from '@/features/cart/hooks/useCart'
import { useContainersRealtime } from '@/features/containers/hooks/useContainersRealtime'
import { useProductsRealtime } from '@/features/catalog/hooks/useProductsRealtime'

function CartSync() {
  useCart()
  return null
}

function ContainersSync() {
  useContainersRealtime()
  return null
}

function CatalogSync() {
  useProductsRealtime()
  return null
}

export function SellerLayout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <CartSync />
      <ContainersSync />
      <CatalogSync />
      <Navbar showCart showMenuToggle={false} />
      <OrderWindowBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
    </div>
  )
}
