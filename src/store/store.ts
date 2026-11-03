import { createContext, useContext } from 'react'
import type { CartItem, Size } from '../types'

export interface Toast {
  id: number
  message: string
  action?: { label: string; to: string }
}

export interface StoreValue {
  wishlist: string[]
  cart: CartItem[]
  cartCount: number
  toast: Toast | null
  isWishlisted: (productId: string) => boolean
  /** Most units of a size a shopper can have in the bag (stock, capped at 5) */
  maxQty: (productId: string, size: Size) => number
  toggleWishlist: (productId: string) => void
  addToCart: (productId: string, size: Size, color: string, qty?: number) => void
  updateQty: (key: string, qty: number) => void
  removeFromCart: (key: string) => void
  moveToWishlist: (key: string) => void
  clearCart: () => void
  showToast: (message: string, action?: Toast['action']) => void
  dismissToast: () => void
  /** Opens the size picker sheet for a product (used by cards and the wishlist). */
  quickAddId: string | null
  openQuickAdd: (productId: string) => void
  closeQuickAdd: () => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
