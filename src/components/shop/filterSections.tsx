import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { categories, occasions, priceBands, sizeOrder } from '../../data/catalog'
import { applyFilters, type Filters } from '../../lib/filters'
import { isSizeAvailable } from '../../lib/product'
import { cn } from '../../lib/format'
import { CheckOption, RadioOption } from './FilterControls'
import type { Category, Occasion, Product, Size } from '../../types'

export interface FilterSection {
  id: string
  label: string
  activeCount: number
  content: ReactNode
}

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** Builds the filter facets with live counts; rendered stacked on desktop and tabbed on mobile. */
export function buildFilterSections(
  products: Product[],
  filters: Filters,
  update: (patch: Partial<Filters>) => void,
): FilterSection[] {
  const pool = (skip: keyof Filters) => applyFilters(products, filters, skip)

  const categoryPool = pool('categories')
  const occasionPool = pool('occasions')
  const pricePool = pool('prices')
  const sizePool = pool('sizes')

  return [
    {
      id: 'category',
      label: 'Category',
      activeCount: filters.categories.length,
      content: categories.map((c) => (
        <CheckOption
          key={c.slug}
          label={c.name}
          count={categoryPool.filter((p) => p.category === c.name).length}
          checked={filters.categories.includes(c.name)}
          onChange={() => update({ categories: toggle<Category>(filters.categories, c.name) })}
        />
      )),
    },
    {
      id: 'price',
      label: 'Price',
      activeCount: filters.prices.length,
      content: priceBands.map((b) => (
        <CheckOption
          key={b.id}
          label={b.label}
          count={pricePool.filter((p) => p.price >= b.min && p.price <= b.max).length}
          checked={filters.prices.includes(b.id)}
          onChange={() => update({ prices: toggle(filters.prices, b.id) })}
        />
      )),
    },
    {
      id: 'size',
      label: 'Size',
      activeCount: filters.sizes.length,
      content: (
        <div className="flex flex-wrap gap-2 py-1">
          {sizeOrder.map((s) => {
            const available = sizePool.some((p) => isSizeAvailable(p, s))
            const active = filters.sizes.includes(s)
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                disabled={!available && !active}
                onClick={() => update({ sizes: toggle<Size>(filters.sizes, s) })}
                className={cn(
                  'h-11 min-w-12 rounded-full border px-3 text-sm font-semibold transition',
                  active ? 'border-maroon bg-maroon text-white' : 'border-ink/15 bg-white hover:border-maroon',
                  !available && !active && 'opacity-40',
                )}
              >
                {s}
              </button>
            )
          })}
        </div>
      ),
    },
    {
      id: 'occasion',
      label: 'Occasion',
      activeCount: filters.occasions.length,
      content: occasions.map((o) => (
        <CheckOption
          key={o.name}
          label={o.name}
          count={occasionPool.filter((p) => p.occasion === o.name).length}
          checked={filters.occasions.includes(o.name)}
          onChange={() => update({ occasions: toggle<Occasion>(filters.occasions, o.name) })}
        />
      )),
    },
    {
      id: 'discount',
      label: 'Discount',
      activeCount: filters.minDiscount ? 1 : 0,
      content: [20, 25, 30].map((d) => (
        <RadioOption
          key={d}
          label={`${d}% and above`}
          checked={filters.minDiscount === d}
          onChange={() => update({ minDiscount: filters.minDiscount === d ? 0 : d })}
        />
      )),
    },
    {
      id: 'rating',
      label: 'Customer rating',
      activeCount: filters.minRating ? 1 : 0,
      content: [4.5, 4].map((r) => (
        <RadioOption
          key={r}
          label={
            <span className="inline-flex items-center gap-1">
              {r} <Star className="size-3.5 fill-ink" strokeWidth={0} /> & above
            </span>
          }
          checked={filters.minRating === r}
          onChange={() => update({ minRating: filters.minRating === r ? 0 : r })}
        />
      )),
    },
  ]
}
