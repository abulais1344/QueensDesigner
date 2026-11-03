import type { Product, Size } from '../types'

export const LOW_STOCK_THRESHOLD = 5

export function discountPercent(p: Pick<Product, 'price' | 'mrp'>) {
  return p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0
}

export function stockFor(p: Product, size: Size) {
  return p.sizes.includes(size) ? (p.stock[size] ?? 0) : 0
}

export function totalStock(p: Product) {
  return p.sizes.reduce((sum, size) => sum + stockFor(p, size), 0)
}

export function isSizeAvailable(p: Product, size: Size) {
  return stockFor(p, size) > 0
}

export const isOutOfStock = (p: Product) => totalStock(p) === 0

/** Remaining units when the product is nearly sold out, otherwise null. */
export function lowStockCount(p: Product) {
  const total = totalStock(p)
  return total > 0 && total <= LOW_STOCK_THRESHOLD ? total : null
}

export function selectBestSellers(products: Product[]) {
  return products.filter((p) => p.isBestseller).sort((a, b) => a.rank - b.rank)
}

export function selectNewArrivals(products: Product[], limit = 10) {
  return [...products].sort((a, b) => b.arrival - a.arrival).slice(0, limit)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
