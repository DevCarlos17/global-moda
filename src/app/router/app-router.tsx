import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { SellerLayout } from "@/modules/layouts/SellerLayout";
import { AdminLayout } from "@/modules/layouts/AdminLayout";
import { PublicLayout } from "@/modules/layouts/PublicLayout";

// Public pages
import { PublicCatalogPage } from "@/pages/public/PublicCatalogPage";
import { PublicProductDetailPage } from "@/pages/public/PublicProductDetailPage";
import { PublicCheckoutPage } from "@/pages/public/PublicCheckoutPage";
import { PublicOrderSuccessPage } from "@/pages/public/PublicOrderSuccessPage";

// Auth
import { LoginPage } from "@/pages/auth/LoginPage";

// Seller pages
import { CatalogPage } from "@/pages/seller/CatalogPage";
import { ProductDetailPage } from "@/pages/seller/ProductDetailPage";
import { CartPage } from "@/pages/seller/CartPage";
import { ReviewOrderPage } from "@/pages/seller/ReviewOrderPage";
import { OrderSuccessPage } from "@/pages/seller/OrderSuccessPage";
import { OrdersPage } from "@/pages/seller/OrdersPage";
import { OrderDetailPage } from "@/pages/seller/OrderDetailPage";

// Admin pages
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { AdminOrdersPage } from "@/pages/admin/OrdersPage";
import { ProductsPage } from "@/pages/admin/ProductsPage";
import { ProductFormPage } from "@/pages/admin/ProductFormPage";
import { CategoriesPage } from "@/pages/admin/CategoriesPage";
import { SellersPage } from "@/pages/admin/SellersPage";
import { SellerProfilePage } from "@/pages/admin/SellerProfilePage";
import { ContainersPage } from "@/pages/admin/ContainersPage";
import { ContainerDetailPage } from "@/pages/admin/ContainerDetailPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — Seller */}
        <Route element={<ProtectedRoute />}>
          <Route element={<SellerLayout />}>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/review" element={<ReviewOrderPage />} />
            <Route path="/orders/success" element={<OrderSuccessPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Protected — Admin only */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/products/new" element={<ProductFormPage />} />
              <Route
                path="/admin/products/:id/edit"
                element={<ProductFormPage />}
              />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/sellers" element={<SellersPage />} />
              <Route path="/admin/sellers/:id" element={<SellerProfilePage />} />
              <Route path="/admin/containers" element={<ContainersPage />} />
              <Route path="/admin/containers/:id" element={<ContainerDetailPage />} />
            </Route>
          </Route>
        </Route>

        {/* Public — no auth required */}
        <Route element={<PublicLayout />}>
          <Route path="/public" element={<Navigate to="/public/catalog" replace />} />
          <Route path="/public/catalog" element={<PublicCatalogPage />} />
          <Route path="/public/catalog/:id" element={<PublicProductDetailPage />} />
          <Route path="/public/checkout" element={<PublicCheckoutPage />} />
          <Route path="/public/success" element={<PublicOrderSuccessPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
