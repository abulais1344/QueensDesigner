import { Pencil, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '../../components/ui/ProductImage'
import { categories } from '../../data/catalog'
import { matchesQuery } from '../../lib/filters'
import { cn, formatPrice } from '../../lib/format'
import { discountPercent, LOW_STOCK_THRESHOLD, totalStock } from '../../lib/product'
import { buttonClass } from '../../lib/ui'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import type { Category, Product } from '../../types'
import { AdminPage, inputClass, Panel, StockPill, Toggle } from '../components'

const statusFilters = ['All', 'Live', 'Hidden', 'Low stock', 'Out of stock'] as const

export default function Products() {
  const { products, saveProduct } = useCatalog()
  const { showToast } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('All')

  const rows = useMemo(
    () =>
      products.filter((p) => {
        if (!matchesQuery(p, query)) return false
        if (category !== 'All' && p.category !== category) return false
        const total = totalStock(p)
        if (status === 'Live') return !p.hidden
        if (status === 'Hidden') return p.hidden
        if (status === 'Low stock') return total > 0 && total <= LOW_STOCK_THRESHOLD
        if (status === 'Out of stock') return total === 0
        return true
      }),
    [products, query, category, status],
  )

  const setVisible = async (p: Product, visible: boolean) => {
    await saveProduct({ ...p, hidden: !visible })
    showToast(visible ? `${p.name} is live` : `${p.name} hidden from store`)
  }

  return (
    <AdminPage
      title="Products"
      description={`${products.length} products · ${products.filter((p) => p.hidden).length} hidden`}
      actions={
        <Link to="/admin/products/new" className={buttonClass('primary', 'sm')}>
          <Plus className="size-4" /> Add product
        </Link>
      }
    >
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, fabric, colour…" aria-label="Search products" className={`${inputClass} pl-10`} />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value as Category | 'All')} aria-label="Category" className={inputClass}>
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {statusFilters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={cn('h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold', status === s ? 'border-ink bg-ink text-white' : 'border-line bg-white')}
          >
            {s}
          </button>
        ))}
      </div>

      <Panel>
        {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-muted">No products match these filters.</p>}

        {/* Desktop table */}
        {rows.length > 0 && (
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-bold">Product</th>
                <th className="px-3 py-3 font-bold">Category</th>
                <th className="px-3 py-3 font-bold">Price</th>
                <th className="px-3 py-3 font-bold">Stock</th>
                <th className="px-3 py-3 font-bold">Live</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id} className={cn(p.hidden && 'bg-ivory/70')}>
                  <td className="px-5 py-3">
                    <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-maroon">
                      <ProductImage photo={p.photos[0]} alt="" sizes="48px" className={cn('aspect-[4/5] w-11 shrink-0 rounded-lg', p.hidden && 'opacity-50')} />
                      <span className="min-w-0">
                        <span className="block font-semibold">{p.name}</span>
                        <span className="block text-xs text-subtle">{p.subtitle}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted">{p.category}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="font-semibold">{formatPrice(p.price)}</span>
                    {discountPercent(p) > 0 && <span className="block text-xs text-subtle">{discountPercent(p)}% off {formatPrice(p.mrp)}</span>}
                  </td>
                  <td className="px-3 py-3">
                    <StockPill total={totalStock(p)} />
                  </td>
                  <td className="px-3 py-3">
                    <Toggle checked={!p.hidden} onChange={(v) => setVisible(p, v)} label={`Show ${p.name} in store`} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/admin/products/${p.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-maroon hover:bg-blush">
                      <Pencil className="size-4" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mobile list */}
        <ul className="divide-y divide-line md:hidden">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <Link to={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <ProductImage photo={p.photos[0]} alt="" sizes="56px" className={cn('aspect-[4/5] w-14 shrink-0 rounded-lg', p.hidden && 'opacity-50')} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block text-sm">{formatPrice(p.price)}</span>
                  <span className="mt-1 block">
                    <StockPill total={totalStock(p)} />
                  </span>
                </span>
              </Link>
              <Toggle checked={!p.hidden} onChange={(v) => setVisible(p, v)} label={`Show ${p.name} in store`} />
            </li>
          ))}
        </ul>
      </Panel>
    </AdminPage>
  )
}
