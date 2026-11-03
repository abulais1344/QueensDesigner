import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { stockFor } from '../lib/product'
import type { CartItem, Size } from '../types'
import { useCatalog } from './catalog'
import { StoreContext, type StoreValue, type Toast } from './store'

const MAX_QTY = 5

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable (private mode) — state still works for this session.
    }
  }, [key, value])
  return [value, setValue] as const
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useCatalog()
  const [wishlist, setWishlist] = usePersistentState<string[]>('qc.wishlist', [])
  const [storedCart, setCart] = usePersistentState<CartItem[]>('qc.cart', [])
  const [toast, setToast] = useState<Toast | null>(null)
  const [quickAddId, setQuickAddId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)

  // Drop items whose product was removed or hidden, and cap quantities at what's in stock.
  const cart = useMemo(
    () =>
      storedCart.flatMap((item) => {
        const product = getProduct(item.productId)
        const available = product ? Math.min(stockFor(product, item.size), MAX_QTY) : 0
        return available ? [{ ...item, qty: Math.min(item.qty, available) }] : []
      }),
    [storedCart, getProduct],
  )

  const maxQty = useCallback(
    (productId: string, size: Size) => {
      const product = getProduct(productId)
      return product ? Math.min(stockFor(product, size), MAX_QTY) : 0
    },
    [getProduct],
  )

  const showToast = useCallback((message: string, action?: Toast['action']) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), message, action })
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const toggleWishlist = useCallback(
    (productId: string) => {
      const adding = !wishlist.includes(productId)
      setWishlist((prev) => (adding ? [productId, ...prev] : prev.filter((id) => id !== productId)))
      showToast(adding ? 'Saved to wishlist' : 'Removed from wishlist', adding ? { label: 'View', to: '/wishlist' } : undefined)
    },
    [wishlist, setWishlist, showToast],
  )

  const addToCart = useCallback(
    (productId: string, size: Size, color: string, qty = 1) => {
      const key = `${productId}__${size}__${color}`
      const limit = maxQty(productId, size)
      const inBag = cart.find((item) => item.key === key)?.qty ?? 0
      if (inBag + qty > limit) {
        showToast(limit ? `Only ${limit} available in size ${size}` : `Size ${size} is sold out`)
        if (inBag >= limit) return
      }
      setCart((prev) => {
        const existing = prev.find((item) => item.key === key)
        if (existing) return prev.map((item) => (item.key === key ? { ...item, qty: Math.min(item.qty + qty, limit) } : item))
        return [{ key, productId, size, color, qty: Math.min(qty, limit) }, ...prev]
      })
      if (inBag + qty <= limit) showToast('Added to bag', { label: 'View bag', to: '/bag' })
    },
    [cart, maxQty, setCart, showToast],
  )

  const updateQty = useCallback(
    (key: string, qty: number) =>
      setCart((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, qty: Math.max(1, Math.min(qty, maxQty(item.productId, item.size))) } : item,
        ),
      ),
    [setCart, maxQty],
  )

  const removeFromCart = useCallback(
    (key: string) => {
      setCart((prev) => prev.filter((item) => item.key !== key))
      showToast('Removed from bag')
    },
    [setCart, showToast],
  )

  const moveToWishlist = useCallback(
    (key: string) => {
      const item = cart.find((i) => i.key === key)
      if (!item) return
      setCart((prev) => prev.filter((i) => i.key !== key))
      setWishlist((prev) => (prev.includes(item.productId) ? prev : [item.productId, ...prev]))
      showToast('Moved to wishlist', { label: 'View', to: '/wishlist' })
    },
    [cart, setCart, setWishlist, showToast],
  )

  const value = useMemo<StoreValue>(
    () => ({
      wishlist,
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
      toast,
      isWishlisted: (id) => wishlist.includes(id),
      maxQty,
      toggleWishlist,
      addToCart,
      updateQty,
      removeFromCart,
      moveToWishlist,
      clearCart: () => setCart([]),
      showToast,
      dismissToast,
      quickAddId,
      openQuickAdd: setQuickAddId,
      closeQuickAdd: () => setQuickAddId(null),
      searchOpen,
      setSearchOpen,
    }),
    [wishlist, cart, toast, maxQty, toggleWishlist, addToCart, updateQty, removeFromCart, moveToWishlist, setCart, showToast, dismissToast, quickAddId, searchOpen],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
