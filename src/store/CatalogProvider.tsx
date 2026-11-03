import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { seedProducts } from '../data/products'
import { kv } from '../lib/db'
import { stockFor } from '../lib/product'
import type { Order, OrderStatus, Product } from '../types'
import { CatalogContext, type CatalogValue, type PlaceOrderInput } from './catalog'

// All persistence goes through these keys; swap this module for API calls to move to a real backend.
const PRODUCTS_KEY = 'products.v1'
const ORDERS_KEY = 'orders.v1'
const SEED_VERSION_KEY = 'seedVersion'
/** Bump when seed products are added so browsers with saved data receive them. */
const SEED_VERSION = 2
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('qc-catalog') : null

interface State {
  products: Product[]
  orders: Order[]
}

async function load(): Promise<State> {
  const [stored, orders, seedVersion] = await Promise.all([
    kv.get<Product[]>(PRODUCTS_KEY),
    kv.get<Order[]>(ORDERS_KEY),
    kv.get<number>(SEED_VERSION_KEY),
  ])
  let products = stored ?? seedProducts
  if (stored && (seedVersion ?? 1) < SEED_VERSION) {
    // Add newly seeded products without touching the admin's existing edits.
    const added = seedProducts.filter((p) => !stored.some((s) => s.id === p.id))
    products = [...added, ...stored]
    await kv.set(PRODUCTS_KEY, products)
  }
  if (seedVersion !== SEED_VERSION) await kv.set(SEED_VERSION_KEY, SEED_VERSION)
  return { products, orders: orders ?? [] }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null)
  // Latest committed state, so back-to-back operations never read a stale render's snapshot.
  const latest = useRef<State | null>(null)

  useEffect(() => {
    const apply = (next: State) => {
      latest.current = next
      setState(next)
    }
    const refresh = () =>
      load()
        .then(apply)
        .catch(() => apply({ products: seedProducts, orders: [] }))
    refresh()
    // Keep other open tabs (storefront ↔ admin) in sync.
    channel?.addEventListener('message', refresh)
    return () => channel?.removeEventListener('message', refresh)
  }, [])

  const commit = useCallback(async (next: State) => {
    latest.current = next
    setState(next)
    await Promise.all([kv.set(PRODUCTS_KEY, next.products), kv.set(ORDERS_KEY, next.orders)])
    channel?.postMessage('changed')
  }, [])

  const current = useCallback(() => {
    if (!latest.current) throw new Error('Catalog is still loading')
    return latest.current
  }, [])

  const value = useMemo<CatalogValue | null>(() => {
    if (!state) return null
    const visibleProducts = state.products.filter((p) => !p.hidden)

    const saveProducts = async (updated: Product[]) => {
      const { products, orders } = current()
      const byId = new Map(updated.map((p) => [p.id, p]))
      const merged = products.map((p) => byId.get(p.id) ?? p)
      const added = updated.filter((p) => !products.some((existing) => existing.id === p.id))
      await commit({ products: [...added, ...merged], orders })
    }

    const adjustStock = (products: Product[], items: Order['items'], direction: 1 | -1) =>
      products.map((p) => {
        const lines = items.filter((i) => i.productId === p.id)
        if (!lines.length) return p
        const stock = { ...p.stock }
        lines.forEach((l) => (stock[l.size] = Math.max(0, (stock[l.size] ?? 0) + direction * l.qty)))
        return { ...p, stock }
      })

    return {
      products: state.products,
      visibleProducts,
      getProduct: (id) => visibleProducts.find((p) => p.id === id),
      saveProduct: (product) => saveProducts([product]),
      saveProducts,
      deleteProduct: async (id) => {
        const { products, orders } = current()
        await commit({ products: products.filter((p) => p.id !== id), orders })
      },
      orders: state.orders,
      placeOrder: async ({ items, customer, payment, couponDiscount, shipping }: PlaceOrderInput) => {
        const { products, orders } = current()
        const orderItems = items.map((item) => {
          const product = products.find((p) => p.id === item.productId && !p.hidden)
          if (!product) throw new Error('An item in your bag is no longer available')
          const available = stockFor(product, item.size)
          if (available < item.qty)
            throw new Error(
              available
                ? `Only ${available} left of ${product.name} in size ${item.size}`
                : `${product.name} in size ${item.size} just sold out`,
            )
          return {
            productId: product.id,
            name: product.name,
            photo: product.photos[0],
            size: item.size,
            color: item.color,
            qty: item.qty,
            price: product.price,
          }
        })
        const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0)
        const order: Order = {
          id: `QC${Date.now().toString().slice(-8)}`,
          createdAt: new Date().toISOString(),
          status: 'New',
          customer,
          payment,
          items: orderItems,
          subtotal,
          couponDiscount,
          shipping,
          total: subtotal - couponDiscount + shipping,
        }
        await commit({ products: adjustStock(products, orderItems, -1), orders: [order, ...orders] })
        return order
      },
      updateOrderStatus: async (id, status: OrderStatus) => {
        const { products, orders } = current()
        const order = orders.find((o) => o.id === id)
        if (!order || order.status === status) return
        // Cancelling returns items to stock; un-cancelling takes them out again.
        let nextProducts = products
        if (status === 'Cancelled') nextProducts = adjustStock(products, order.items, 1)
        else if (order.status === 'Cancelled') nextProducts = adjustStock(products, order.items, -1)
        await commit({ products: nextProducts, orders: orders.map((o) => (o.id === id ? { ...o, status } : o)) })
      },
      resetDemoData: () => commit({ products: seedProducts, orders: [] }),
    }
  }, [state, commit, current])

  // The ref is only read inside the async operations, never while rendering.
  // oxlint-disable-next-line react/refs
  if (!state || !value) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ivory" aria-busy="true">
        <span className="animate-pulse font-display text-3xl font-bold text-maroon">Queens</span>
      </div>
    )
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
