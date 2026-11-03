import { categories, priceBands, sortOptions, type SortId } from '../data/catalog'
import { discountPercent, isSizeAvailable } from './product'
import type { Category, Occasion, Product, Size } from '../types'

export interface Filters {
  q: string
  categories: Category[]
  prices: string[]
  sizes: Size[]
  occasions: Occasion[]
  minDiscount: number
  minRating: number
  sort: SortId
}

const list = (params: URLSearchParams, key: string) => params.get(key)?.split(',').filter(Boolean) ?? []

export function parseFilters(params: URLSearchParams): Filters {
  const sort = params.get('sort')
  return {
    q: params.get('q') ?? '',
    categories: list(params, 'category')
      .map((slug) => categories.find((c) => c.slug === slug)?.name)
      .filter((c): c is Category => Boolean(c)),
    prices: list(params, 'price'),
    sizes: list(params, 'size') as Size[],
    occasions: list(params, 'occasion') as Occasion[],
    minDiscount: Number(params.get('discount')) || 0,
    minRating: Number(params.get('rating')) || 0,
    sort: sortOptions.some((o) => o.id === sort) ? (sort as SortId) : 'recommended',
  }
}

export function filtersToParams(f: Filters) {
  const params = new URLSearchParams()
  if (f.q) params.set('q', f.q)
  if (f.categories.length)
    params.set('category', f.categories.map((name) => categories.find((c) => c.name === name)!.slug).join(','))
  if (f.prices.length) params.set('price', f.prices.join(','))
  if (f.sizes.length) params.set('size', f.sizes.join(','))
  if (f.occasions.length) params.set('occasion', f.occasions.join(','))
  if (f.minDiscount) params.set('discount', String(f.minDiscount))
  if (f.minRating) params.set('rating', String(f.minRating))
  if (f.sort !== 'recommended') params.set('sort', f.sort)
  return params
}

export function countActiveFilters(f: Filters) {
  return (
    f.categories.length + f.prices.length + f.sizes.length + f.occasions.length + (f.minDiscount ? 1 : 0) + (f.minRating ? 1 : 0)
  )
}

export function matchesQuery(p: Product, q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const haystack = [p.name, p.category, p.subtitle, p.fabric, p.work, p.occasion, ...p.colors.map((c) => c.name)]
    .join(' ')
    .toLowerCase()
  return terms.every((t) => haystack.includes(t))
}

/** Applies every filter except `skip`, so facet counts can reflect the other active filters. */
export function applyFilters(items: Product[], f: Filters, skip?: keyof Filters) {
  return items.filter((p) => {
    if (skip !== 'q' && !matchesQuery(p, f.q)) return false
    if (skip !== 'categories' && f.categories.length && !f.categories.includes(p.category)) return false
    if (skip !== 'occasions' && f.occasions.length && !f.occasions.includes(p.occasion)) return false
    if (skip !== 'sizes' && f.sizes.length && !f.sizes.some((s) => isSizeAvailable(p, s)))
      return false
    if (
      skip !== 'prices' &&
      f.prices.length &&
      !priceBands.some((b) => f.prices.includes(b.id) && p.price >= b.min && p.price <= b.max)
    )
      return false
    if (skip !== 'minDiscount' && discountPercent(p) < f.minDiscount) return false
    if (skip !== 'minRating' && p.rating < f.minRating) return false
    return true
  })
}

export function sortProducts(items: Product[], sort: SortId) {
  const sorted = [...items]
  switch (sort) {
    case 'new':
      return sorted.sort((a, b) => b.arrival - a.arrival)
    case 'popular':
      return sorted.sort((a, b) => b.reviews - a.reviews)
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    case 'discount':
      return sorted.sort((a, b) => discountPercent(b) - discountPercent(a))
    default:
      return sorted.sort((a, b) => a.rank - b.rank)
  }
}
