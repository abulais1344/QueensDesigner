import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductImage } from '../../components/ui/ProductImage'
import { sizeOrder } from '../../data/catalog'
import { matchesQuery } from '../../lib/filters'
import { cn } from '../../lib/format'
import { stockFor } from '../../lib/product'
import { buttonClass } from '../../lib/ui'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import type { Product, Size } from '../../types'
import { AdminPage, inputClass, Panel, Toggle } from '../components'

interface RowEdit {
  price: string
  mrp: string
  stock: Partial<Record<Size, string>>
}

const LOW = 2

export default function Inventory() {
  const { products, saveProducts } = useCatalog()
  const { showToast } = useStore()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [lowOnly, setLowOnly] = useState(params.get('filter') === 'low')
  const [edits, setEdits] = useState<Record<string, RowEdit>>({})
  const [saving, setSaving] = useState(false)

  const rows = useMemo(
    () =>
      products.filter(
        (p) => matchesQuery(p, query) && (!lowOnly || edits[p.id] || p.sizes.some((s) => stockFor(p, s) <= LOW)),
      ),
    // Edited rows stay visible while "low stock only" is on, even after restocking them.
    [products, query, lowOnly, edits],
  )

  const valueOf = (p: Product): RowEdit =>
    edits[p.id] ?? { price: String(p.price), mrp: String(p.mrp), stock: Object.fromEntries(p.sizes.map((s) => [s, String(stockFor(p, s))])) }

  const edit = (p: Product, patch: Partial<RowEdit>) => setEdits((all) => ({ ...all, [p.id]: { ...valueOf(p), ...patch } }))

  const rowError = (p: Product) => {
    const e = edits[p.id]
    if (!e) return null
    const price = Number(e.price)
    const mrp = Number(e.mrp)
    if (!(price > 0)) return 'Price must be above 0'
    if (mrp < price) return 'MRP is below price'
    if (p.sizes.some((s) => !Number.isInteger(Number(e.stock[s])) || Number(e.stock[s]) < 0)) return 'Stock must be 0 or more'
    return null
  }

  const changed = Object.keys(edits)
  const invalid = products.filter((p) => rowError(p))

  const save = async () => {
    if (invalid.length) return showToast(`Fix ${invalid.length} highlighted ${invalid.length === 1 ? 'row' : 'rows'} first`)
    setSaving(true)
    const updated = products
      .filter((p) => edits[p.id])
      .map((p) => {
        const e = edits[p.id]
        return { ...p, price: Number(e.price), mrp: Number(e.mrp), stock: Object.fromEntries(p.sizes.map((s) => [s, Number(e.stock[s])])) }
      })
    await saveProducts(updated)
    setEdits({})
    setSaving(false)
    showToast(`Saved ${updated.length} ${updated.length === 1 ? 'product' : 'products'}`)
  }

  const cellInput = 'h-10 w-full rounded-lg border bg-white px-2 text-right text-sm outline-none focus:border-maroon'

  return (
    <AdminPage title="Inventory & prices" description="Edit prices and stock across products, then save once.">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" className={`${inputClass} pl-10`} />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <Toggle checked={lowOnly} onChange={setLowOnly} label="Show low stock only" />
          Low stock only (≤ {LOW} in a size)
        </label>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-bold">Product</th>
                <th className="w-28 px-2 py-3 text-right font-bold">Price ₹</th>
                <th className="w-28 px-2 py-3 text-right font-bold">MRP ₹</th>
                {sizeOrder.map((s) => (
                  <th key={s} className="w-16 px-1.5 py-3 text-center font-bold">
                    {s}
                  </th>
                ))}
                <th className="w-16 px-4 py-3 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => {
                const v = valueOf(p)
                const error = rowError(p)
                const dirty = Boolean(edits[p.id])
                const total = p.sizes.reduce((n, s) => n + (Number(v.stock[s]) || 0), 0)
                return (
                  <tr key={p.id} className={cn(error ? 'bg-blush/60' : dirty && 'bg-gold-soft/50')}>
                    <td className={cn('sticky left-0 z-10 px-4 py-2', error ? 'bg-blush' : dirty ? 'bg-gold-soft' : 'bg-white')}>
                      <Link to={`/admin/products/${p.id}`} className="flex max-w-60 items-center gap-2.5 hover:text-maroon">
                        <ProductImage photo={p.photos[0]} alt="" sizes="40px" className="aspect-[4/5] w-9 shrink-0 rounded-md" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{p.name}</span>
                          {error ? <span className="block text-xs font-semibold text-rose-dark">{error}</span> : p.hidden && <span className="block text-xs text-subtle">Hidden</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min={1} inputMode="numeric" value={v.price} onChange={(e) => edit(p, { price: e.target.value })} aria-label={`Price of ${p.name}`} className={cn(cellInput, 'border-line')} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min={1} inputMode="numeric" value={v.mrp} onChange={(e) => edit(p, { mrp: e.target.value })} aria-label={`MRP of ${p.name}`} className={cn(cellInput, 'border-line')} />
                    </td>
                    {sizeOrder.map((s) => {
                      if (!p.sizes.includes(s))
                        return (
                          <td key={s} className="px-1.5 py-2 text-center text-subtle" aria-label={`${s} not offered`}>
                            —
                          </td>
                        )
                      const qty = Number(v.stock[s])
                      return (
                        <td key={s} className="px-1.5 py-2">
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={v.stock[s] ?? ''}
                            onChange={(e) => edit(p, { stock: { ...v.stock, [s]: e.target.value } })}
                            aria-label={`${p.name} stock in size ${s}`}
                            className={cn(cellInput, 'text-center', qty === 0 ? 'border-rose-dark/50 text-rose-dark' : qty <= LOW ? 'border-gold' : 'border-line')}
                          />
                        </td>
                      )
                    })}
                    <td className="px-4 py-2 text-right font-bold">{total}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-muted">{lowOnly ? 'Nothing is running low.' : 'No products match.'}</p>}
      </Panel>

      {changed.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:left-[248px]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 md:px-4">
            <p className="flex-1 text-sm font-semibold">
              {changed.length} {changed.length === 1 ? 'product' : 'products'} changed
            </p>
            <button type="button" onClick={() => setEdits({})} className={buttonClass('outline', 'md')}>
              Discard
            </button>
            <button type="button" onClick={save} disabled={saving} className={buttonClass('primary', 'md', 'px-8')}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </AdminPage>
  )
}
