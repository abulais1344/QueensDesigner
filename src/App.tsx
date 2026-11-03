import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Bag from './pages/Bag'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProductDetail from './pages/ProductDetail'
import Shop from './pages/Shop'
import Wishlist from './pages/Wishlist'
import { CatalogProvider } from './store/CatalogProvider'
import { StoreProvider } from './store/StoreProvider'

const AdminRoutes = lazy(() => import('./admin/AdminRoutes'))

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <StoreProvider>
          <Routes>
            <Route
              path="admin/*"
              element={
                <Suspense fallback={<div className="min-h-dvh bg-ivory" />}>
                  <AdminRoutes />
                </Suspense>
              }
            />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="collections" element={<Navigate to="/shop" replace />} />
              <Route path="bridal" element={<Navigate to="/shop?category=bridal" replace />} />
              <Route path="product/:productId" element={<ProductDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="bag" element={<Bag />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </StoreProvider>
      </CatalogProvider>
    </BrowserRouter>
  )
}
