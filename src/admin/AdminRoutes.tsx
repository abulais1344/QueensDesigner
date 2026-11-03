import { Route, Routes } from 'react-router-dom'
import NotFound from '../pages/NotFound'
import { AdminLayout } from './AdminLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import Orders from './pages/Orders'
import ProductEditor from './pages/ProductEditor'
import Products from './pages/Products'

/** Loaded on demand so the admin code never ships with the storefront bundle. */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductEditor />} />
        <Route path="products/:productId" element={<ProductEditor />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
