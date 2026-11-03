import { createContext, useContext } from 'react'
import type { CartItem, Customer, Order, OrderStatus, Product } from '../types'

export interface PlaceOrderInput {
  items: CartItem[]
  customer: Customer
  payment: Order['payment']
  couponDiscount: number
  shipping: number
}

export interface CatalogValue {
  /** Every product, including hidden ones (admin) */
  products: Product[]
  /** Products customers can see */
  visibleProducts: Product[]
  /** Looks up a product customers can see */
  getProduct: (id: string | undefined) => Product | undefined
  saveProduct: (product: Product) => Promise<void>
  saveProducts: (products: Product[]) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  orders: Order[]
  /** Validates stock, decrements inventory and records the order. Throws with a customer-facing message. */
  placeOrder: (input: PlaceOrderInput) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  resetDemoData: () => Promise<void>
}

export const CatalogContext = createContext<CatalogValue | null>(null)

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>')
  return ctx
}
