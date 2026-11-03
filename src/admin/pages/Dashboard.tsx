import { AlertTriangle, ArrowRight, IndianRupee, Package, ReceiptText, RotateCcw, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '../../components/ui/ProductImage'
import { Sheet } from '../../components/ui/Sheet'
import { formatPrice } from '../../lib/format'
import { stockFor, totalStock } from '../../lib/product'
import { buttonClass } from '../../lib/ui'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import { AdminPage, Panel, StatusPill } from '../components'

export default function Dashboard() {
  const { products, orders, resetDemoData } = useCatalog()
  const { showToast } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const liveOrders = orders.filter((o) => o.status !== 'Cancelled')
  const revenue = liveOrders.reduce((sum, o) => sum + o.total, 0)
  const unitsSold = liveOrders.reduce((sum, o) => sum + o.items.reduce((n, i) => n + i.qty, 0), 0)
  const newOrders = orders.filter((o) => o.status === 'New').length

  // Live products with sizes that are out or nearly out, most sold-out sizes first.
  const restock = products
    .filter((p) => !p.hidden)
    .map((p) => ({ product: p, sizes: p.sizes.map((size) => ({ size, qty: stockFor(p, size) })).filter((s) => s.qty <= 2) }))
    .filter((row) => row.sizes.length)
    .sort((a, b) => b.sizes.filter((s) => !s.qty).length - a.sizes.filter((s) => !s.qty).length)
  const outOfStock = products.filter((p) => !p.hidden && totalStock(p) === 0).length

  const stats = [
    { label: 'Revenue', value: formatPrice(revenue), note: `${liveOrders.length} orders`, icon: IndianRupee },
    { label: 'New orders', value: String(newOrders), note: 'Waiting to be packed', icon: ReceiptText, to: '/admin/orders' },
    { label: 'Units sold', value: String(unitsSold), note: 'Excludes cancelled', icon: ShoppingBag },
    {
      label: 'Live products',
      value: String(products.filter((p) => !p.hidden).length),
      note: `${products.filter((p) => p.hidden).length} hidden · ${outOfStock} sold out`,
      icon: Package,
      to: '/admin/products',
    },
  ]

  return (
    <AdminPage
      title="Dashboard"
      description="Today at Queens Collection"
      actions={
        <Link to="/admin/products/new" className={buttonClass('primary', 'sm')}>
          Add product
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, note, icon: Icon, to }) => {
          const body = (
            <>
              <span className="grid size-10 place-items-center rounded-full bg-blush text-maroon">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-sm text-muted">{label}</p>
              <p className="text-2xl font-extrabold tracking-[-0.02em]">{value}</p>
              <p className="mt-1 text-xs text-subtle">{note}</p>
            </>
          )
          return to ? (
            <Link key={label} to={to} className="rounded-2xl bg-white p-4 ring-1 ring-line transition hover:ring-maroon/40 md:p-5">
              {body}
            </Link>
          ) : (
            <div key={label} className="rounded-2xl bg-white p-4 ring-1 ring-line md:p-5">
              {body}
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          title="Needs restocking"
          action={
            <Link to="/admin/inventory?filter=low" className="inline-flex items-center gap-1 text-sm font-semibold text-maroon">
              Update stock <ArrowRight className="size-4" />
            </Link>
          }
        >
          {restock.length ? (
            <ul className="divide-y divide-line">
              {restock.slice(0, 6).map(({ product, sizes }) => (
                <li key={product.id} className="flex items-center gap-3 px-4 py-3 md:px-5">
                  <ProductImage photo={product.photos[0]} alt="" sizes="48px" className="aspect-[4/5] w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/products/${product.id}`} className="block truncate text-sm font-semibold hover:text-maroon">
                      {product.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sizes.map(({ size, qty }) => (
                        <span
                          key={size}
                          className={qty ? 'rounded-md bg-gold-soft px-1.5 py-0.5 text-[11px] font-bold text-[#7a5a22]' : 'rounded-md bg-blush px-1.5 py-0.5 text-[11px] font-bold text-rose-dark'}
                        >
                          {size} · {qty ? `${qty} left` : 'sold out'}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">All sizes are well stocked.</p>
          )}
          {restock.length > 6 && <p className="border-t border-line px-5 py-3 text-xs text-muted">+ {restock.length - 6} more products running low</p>}
        </Panel>

        <Panel
          title="Recent orders"
          action={
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-maroon">
              All orders <ArrowRight className="size-4" />
            </Link>
          }
        >
          {orders.length ? (
            <ul className="divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders?open=${o.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ivory md:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {o.id} · {o.customer.name}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {o.customer.city}
                      </p>
                    </div>
                    <span className="text-sm font-bold">{formatPrice(o.total)}</span>
                    <StatusPill status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted">
              No orders yet. Place one from the{' '}
              <a href="/" target="_blank" rel="noreferrer" className="font-semibold text-maroon">
                storefront
              </a>{' '}
              to see it here.
            </div>
          )}
        </Panel>
      </div>

      <Panel className="mt-5">
        <div className="flex flex-wrap items-center gap-4 p-4 md:p-5">
          <AlertTriangle className="size-5 shrink-0 text-gold" />
          <p className="min-w-0 flex-1 text-sm text-muted">
            <strong className="text-ink">Demo mode:</strong> products, stock and orders are saved in this browser only. Reset to restore the
            original 24 products and clear all orders.
          </p>
          <button type="button" onClick={() => setConfirmReset(true)} className={buttonClass('outline', 'sm')}>
            <RotateCcw className="size-4" /> Reset demo data
          </button>
        </div>
      </Panel>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?">
        <div className="space-y-5 px-5 py-5">
          <p className="text-[15px] text-muted">
            This deletes every product change, uploaded photo and order, and restores the original catalog. It can’t be undone.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setConfirmReset(false)} className={buttonClass('outline', 'md', 'flex-1')}>
              Keep my data
            </button>
            <button
              type="button"
              onClick={async () => {
                await resetDemoData()
                setConfirmReset(false)
                showToast('Demo data restored')
              }}
              className={buttonClass('primary', 'md', 'flex-1')}
            >
              Reset everything
            </button>
          </div>
        </div>
      </Sheet>
    </AdminPage>
  )
}
