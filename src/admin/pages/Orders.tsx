import { ChevronDown, MapPin, Phone, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProductImage } from '../../components/ui/ProductImage'
import { cn, formatPrice } from '../../lib/format'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import { orderStatuses, type Order, type OrderStatus } from '../../types'
import { AdminPage, Panel, StatusPill } from '../components'

export default function Orders() {
  const { orders, updateOrderStatus } = useCatalog()
  const { showToast } = useStore()
  const [params] = useSearchParams()
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>(params.get('open'))

  const rows = filter === 'All' ? orders : orders.filter((o) => o.status === filter)

  const changeStatus = async (order: Order, status: OrderStatus) => {
    await updateOrderStatus(order.id, status)
    if (status === 'Cancelled') showToast(`${order.id} cancelled — items returned to stock`)
    else if (order.status === 'Cancelled') showToast(`${order.id} reopened — stock deducted again`)
    else showToast(`${order.id} marked ${status}`)
  }

  return (
    <AdminPage title="Orders" description={`${orders.length} orders placed from this browser’s storefront`}>
      {orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No orders yet"
          message="Orders placed from the storefront bag appear here. Open the store in another tab and place a test order."
        />
      ) : (
        <>
          <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {(['All', ...orderStatuses] as const).map((s) => {
              const count = s === 'All' ? orders.length : orders.filter((o) => o.status === s).length
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  aria-pressed={filter === s}
                  className={cn('h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold', filter === s ? 'border-ink bg-ink text-white' : 'border-line bg-white')}
                >
                  {s} <span className={filter === s ? 'text-white/70' : 'text-subtle'}>{count}</span>
                </button>
              )
            })}
          </div>

          <Panel>
            {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-muted">No {filter.toLowerCase()} orders.</p>}
            <ul className="divide-y divide-line">
              {rows.map((order) => {
                const open = openId === order.id
                const units = order.items.reduce((n, i) => n + i.qty, 0)
                return (
                  <li key={order.id}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 md:px-5">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : order.id)}
                        aria-expanded={open}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex -space-x-3">
                          {order.items.slice(0, 3).map((item, i) => (
                            <ProductImage key={i} photo={item.photo} alt="" sizes="40px" className="aspect-[4/5] w-9 rounded-md ring-2 ring-white" />
                          ))}
                        </div>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold">
                            {order.id} · {order.customer.name}
                          </span>
                          <span className="block text-xs text-muted">
                            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {units}{' '}
                            {units === 1 ? 'item' : 'items'} · {order.payment}
                          </span>
                        </span>
                        <ChevronDown className={cn('ml-auto size-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
                      </button>
                      <span className="w-24 text-right text-sm font-bold">{formatPrice(order.total)}</span>
                      <label className="sr-only" htmlFor={`status-${order.id}`}>
                        Status
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                        className="h-10 rounded-full border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-maroon"
                      >
                        {orderStatuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {open && (
                      <div className="grid gap-5 border-t border-line bg-ivory/60 px-4 py-4 md:grid-cols-[1fr_280px] md:px-5">
                        <ul className="space-y-3">
                          {order.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <ProductImage photo={item.photo} alt="" sizes="56px" className="aspect-[4/5] w-12 shrink-0 rounded-lg" />
                              <div className="min-w-0 flex-1 text-sm">
                                <p className="truncate font-semibold">{item.name}</p>
                                <p className="text-xs text-muted">
                                  Size {item.size} · {item.color} · Qty {item.qty}
                                </p>
                              </div>
                              <span className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="space-y-3 text-sm">
                          <div className="rounded-xl bg-white p-3.5 ring-1 ring-line">
                            <p className="font-semibold">{order.customer.name}</p>
                            <p className="mt-1 flex gap-2 text-muted">
                              <Phone className="mt-0.5 size-4 shrink-0" /> +91 {order.customer.phone}
                            </p>
                            <p className="mt-1 flex gap-2 text-muted">
                              <MapPin className="mt-0.5 size-4 shrink-0" />
                              {order.customer.address}, {order.customer.city} – {order.customer.pincode}
                            </p>
                          </div>
                          <dl className="space-y-1.5 rounded-xl bg-white p-3.5 ring-1 ring-line">
                            <div className="flex justify-between">
                              <dt className="text-muted">Subtotal</dt>
                              <dd>{formatPrice(order.subtotal)}</dd>
                            </div>
                            {order.couponDiscount > 0 && (
                              <div className="flex justify-between">
                                <dt className="text-muted">Coupon</dt>
                                <dd className="text-success">− {formatPrice(order.couponDiscount)}</dd>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <dt className="text-muted">Shipping</dt>
                              <dd>{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd>
                            </div>
                            <div className="flex justify-between border-t border-line pt-1.5 font-bold">
                              <dt>Total ({order.payment})</dt>
                              <dd>{formatPrice(order.total)}</dd>
                            </div>
                          </dl>
                          <StatusPill status={order.status} />
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </Panel>
        </>
      )}
    </AdminPage>
  )
}
