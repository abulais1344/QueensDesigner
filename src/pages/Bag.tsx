import { CheckCircle2, Heart, Lock, Minus, Plus, ShoppingBag, Tag, Trash2, Truck, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ProductRail } from '../components/product/ProductRail'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductImage } from '../components/ui/ProductImage'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Sheet } from '../components/ui/Sheet'
import { COUPON, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../data/catalog'
import { cn, deliveryDate, formatPrice } from '../lib/format'
import { selectBestSellers } from '../lib/product'
import { buttonClass } from '../lib/ui'
import { useCatalog } from '../store/catalog'
import { useStore } from '../store/store'
import type { CartItem, Customer, Order, Product } from '../types'

interface Line extends CartItem {
  product: Product
}

export default function Bag() {
  const { cart, cartCount, clearCart } = useStore()
  const { getProduct, visibleProducts } = useCatalog()
  const [coupon, setCoupon] = useState<string | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const bestSellers = selectBestSellers(visibleProducts)

  const lines: Line[] = cart.map((item) => ({ ...item, product: getProduct(item.productId)! }))
  const mrpTotal = lines.reduce((sum, l) => sum + l.product.mrp * l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const couponOff = coupon ? Math.min(Math.round((subtotal * COUPON.percent) / 100), COUPON.maxOff) : 0
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE
  const total = subtotal - couponOff + shipping
  const savings = mrpTotal - subtotal + couponOff

  const onOrderPlaced = (order: Order) => {
    setCheckoutOpen(false)
    setPlacedOrder(order)
    clearCart()
    setCoupon(null)
    window.scrollTo({ top: 0 })
  }

  if (placedOrder) return <OrderPlaced orderId={placedOrder.id} total={placedOrder.total} />

  if (!lines.length) {
    return (
      <div className="container-page">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="Looks like you haven’t added anything yet. Explore our new arrivals and best sellers."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/shop" className={buttonClass('primary')}>
                Start shopping
              </Link>
              <Link to="/wishlist" className={buttonClass('outline')}>
                <Heart className="size-4" /> View wishlist
              </Link>
            </div>
          }
        />
        <section className="mt-4">
          <SectionHeader eyebrow="Most loved" title="Best sellers" linkTo="/shop?sort=popular" />
          <ProductRail products={bestSellers} label="Best sellers" />
        </section>
      </div>
    )
  }

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="container-page pt-5 pb-28 md:pt-8 md:pb-0">
      <div className="mb-5 flex items-baseline gap-3 md:mb-7">
        <h1 className="text-2xl font-extrabold tracking-[-0.025em] md:text-[32px]">Shopping bag</h1>
        <p className="text-sm text-muted">
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
            <Truck className="size-5 shrink-0 text-maroon" />
            <div className="flex-1 text-sm">
              {remaining > 0 ? (
                <>
                  Add <strong>{formatPrice(remaining)}</strong> more for <strong>free shipping</strong>
                </>
              ) : (
                <>
                  Yay! Your order ships <strong className="text-success">free</strong> · Arrives by <strong>{deliveryDate(5)}</strong>
                </>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blush">
                <div className="h-full rounded-full bg-maroon transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
              </div>
            </div>
          </div>

          {lines.map((line) => (
            <BagLine key={line.key} line={line} />
          ))}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <CouponBox applied={coupon} onApply={setCoupon} />

          <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
            <h2 className="text-sm font-extrabold tracking-[0.1em] uppercase">Price details</h2>
            <dl className="mt-4 space-y-3 text-[15px]">
              <Row label={`Total MRP (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`} value={formatPrice(mrpTotal)} />
              <Row label="Discount on MRP" value={`− ${formatPrice(mrpTotal - subtotal)}`} positive />
              {couponOff > 0 && <Row label={`Coupon (${COUPON.code})`} value={`− ${formatPrice(couponOff)}`} positive />}
              <Row label="Shipping" value={shipping ? formatPrice(shipping) : 'FREE'} positive={!shipping} />
              <div className="flex justify-between border-t border-line pt-3 text-base font-extrabold">
                <dt>Total amount</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            {savings > 0 && (
              <p className="mt-4 rounded-xl bg-[#e8f4ee] px-3 py-2.5 text-sm font-semibold text-success">
                You’re saving {formatPrice(savings)} on this order
              </p>
            )}
            <button type="button" onClick={() => setCheckoutOpen(true)} className={buttonClass('primary', 'lg', 'mt-5 hidden w-full lg:flex')}>
              <Lock className="size-4" /> Place order
            </button>
            <p className="mt-3 text-center text-xs text-muted">Secure checkout · UPI, cards, net banking & COD</p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="leading-tight">
          <p className="text-lg font-extrabold">{formatPrice(total)}</p>
          {savings > 0 && <p className="text-xs font-semibold text-success">Saving {formatPrice(savings)}</p>}
        </div>
        <button type="button" onClick={() => setCheckoutOpen(true)} className={buttonClass('primary', 'lg', 'flex-1')}>
          Place order
        </button>
      </div>

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total}
        couponDiscount={couponOff}
        shipping={shipping}
        onPlaced={onOrderPlaced}
      />
    </div>
  )
}

interface CheckoutSheetProps {
  open: boolean
  onClose: () => void
  total: number
  couponDiscount: number
  shipping: number
  onPlaced: (order: Order) => void
}

const emptyCustomer: Customer = { name: '', phone: '', address: '', city: '', pincode: '' }

function CheckoutSheet({ open, onClose, total, couponDiscount, shipping, onPlaced }: CheckoutSheetProps) {
  const { cart } = useStore()
  const { placeOrder } = useCatalog()
  const [customer, setCustomer] = useState(emptyCustomer)
  const [payment, setPayment] = useState<Order['payment']>('COD')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const field = (key: keyof Customer) => ({
    value: customer[key],
    onChange: (e: { target: { value: string } }) => {
      const value = key === 'phone' || key === 'pincode' ? e.target.value.replace(/\D/g, '') : e.target.value
      setCustomer((c) => ({ ...c, [key]: value }))
      setError('')
    },
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (Object.values(customer).some((v) => !v.trim())) return setError('Please fill in all delivery details')
    if (!/^[6-9]\d{9}$/.test(customer.phone)) return setError('Enter a valid 10-digit mobile number')
    if (!/^[1-9]\d{5}$/.test(customer.pincode)) return setError('Enter a valid 6-digit pincode')
    setSubmitting(true)
    try {
      onPlaced(await placeOrder({ items: cart, customer, payment, couponDiscount, shipping }))
      setCustomer(emptyCustomer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place the order, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none placeholder:text-subtle focus:border-maroon'

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Delivery & payment"
      footer={
        <button type="submit" form="checkout-form" disabled={submitting} className={buttonClass('primary', 'lg', 'w-full')}>
          <Lock className="size-4" /> {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
        </button>
      }
    >
      <form id="checkout-form" onSubmit={submit} noValidate className="space-y-3 px-5 py-4">
        <input {...field('name')} autoComplete="name" placeholder="Full name" aria-label="Full name" className={inputClass} />
        <input {...field('phone')} inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile number" aria-label="Mobile number" className={inputClass} />
        <textarea {...field('address')} rows={2} autoComplete="street-address" placeholder="House no., street, area" aria-label="Address" className={cn(inputClass, 'h-auto py-3')} />
        <div className="grid grid-cols-2 gap-3">
          <input {...field('city')} autoComplete="address-level2" placeholder="City" aria-label="City" className={inputClass} />
          <input {...field('pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="Pincode" aria-label="Pincode" className={inputClass} />
        </div>
        <fieldset className="pt-2">
          <legend className="mb-2 text-sm font-bold">Payment</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['COD', 'UPI'] as const).map((method) => (
              <label
                key={method}
                className={cn(
                  'flex h-12 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold',
                  payment === method ? 'border-maroon bg-blush/60 text-maroon' : 'border-line',
                )}
              >
                <input type="radio" name="payment" className="sr-only" checked={payment === method} onChange={() => setPayment(method)} />
                {method === 'COD' ? 'Cash on delivery' : 'UPI on delivery'}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="rounded-xl bg-blush px-3.5 py-2.5 text-sm font-semibold text-rose-dark">
            {error}
          </p>
        )}
      </form>
    </Sheet>
  )
}

function BagLine({ line }: { line: Line }) {
  const { updateQty, removeFromCart, moveToWishlist, maxQty } = useStore()
  const { product } = line
  const limit = maxQty(product.id, line.size)
  const href = `/product/${product.id}`

  return (
    <article className="flex gap-3.5 rounded-2xl bg-white p-3 ring-1 ring-line md:gap-5 md:p-4">
      <Link to={href} className="shrink-0">
        <ProductImage photo={product.photos[0]} alt={product.name} sizes="140px" className="aspect-[4/5] w-24 rounded-xl md:w-32" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{product.category}</p>
            <Link to={href} className="line-clamp-2 text-[15px] font-semibold hover:text-maroon">
              {product.name}
            </Link>
          </div>
          <button type="button" onClick={() => removeFromCart(line.key)} aria-label={`Remove ${product.name}`} className="-mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-blush hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
          <span>
            Size <strong className="text-ink">{line.size}</strong>
          </span>
          <span>
            Colour <strong className="text-ink">{line.color}</strong>
          </span>
        </p>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="font-bold">{formatPrice(product.price * line.qty)}</span>
          {product.mrp > product.price && <span className="text-xs text-subtle line-through">{formatPrice(product.mrp * line.qty)}</span>}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <div className="flex h-10 items-center rounded-full border border-line" role="group" aria-label="Quantity">
            <button type="button" disabled={line.qty <= 1} onClick={() => updateQty(line.key, line.qty - 1)} aria-label="Decrease quantity" className="grid size-10 place-items-center rounded-full disabled:opacity-30">
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center text-sm font-bold" aria-live="polite">
              {line.qty}
            </span>
            <button type="button" disabled={line.qty >= limit} onClick={() => updateQty(line.key, line.qty + 1)} aria-label="Increase quantity" className="grid size-10 place-items-center rounded-full disabled:opacity-30">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="flex">
            <button type="button" onClick={() => moveToWishlist(line.key)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-maroon hover:bg-blush">
              <Heart className="size-4" /> <span className="sm:hidden">Wishlist</span>
              <span className="hidden sm:inline">Move to wishlist</span>
            </button>
            <button type="button" onClick={() => removeFromCart(line.key)} className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-muted hover:bg-blush hover:text-ink sm:inline-flex">
              <Trash2 className="size-4" /> Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function CouponBox({ applied, onApply }: { applied: string | null; onApply: (code: string | null) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  if (applied) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-success/50 bg-[#e8f4ee] p-4">
        <CheckCircle2 className="size-5 shrink-0 text-success" />
        <p className="flex-1 text-sm">
          <strong>{applied}</strong> applied — {COUPON.percent}% off
        </p>
        <button type="button" onClick={() => onApply(null)} className="h-10 rounded-full px-3 text-sm font-bold text-maroon hover:bg-white/60">
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Tag className="size-[18px] text-maroon" /> Apply coupon
      </p>
      <form
        className={cn('mt-3 flex h-12 items-center rounded-full border pr-1.5 pl-4', error ? 'border-rose-dark' : 'border-line focus-within:border-maroon')}
        onSubmit={(e) => {
          e.preventDefault()
          if (code.trim().toUpperCase() === COUPON.code) {
            onApply(COUPON.code)
            setError('')
          } else setError('This coupon code isn’t valid')
        }}
      >
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError('')
          }}
          placeholder="Enter coupon code"
          aria-label="Coupon code"
          className="h-full w-full bg-transparent text-[15px] uppercase outline-none placeholder:text-subtle placeholder:normal-case"
        />
        <button type="submit" className="h-9 rounded-full px-4 text-sm font-bold text-maroon hover:bg-blush">
          Apply
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-rose-dark">{error}</p>
      ) : (
        <button type="button" onClick={() => setCode(COUPON.code)} className="mt-2 text-left text-xs text-muted">
          Try <strong className="text-maroon">{COUPON.code}</strong> for an extra {COUPON.percent}% off (up to {formatPrice(COUPON.maxOff)})
        </button>
      )}
    </div>
  )
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn('font-semibold', positive && 'text-success')}>{value}</dd>
    </div>
  )
}

function OrderPlaced({ orderId, total }: { orderId: string; total: number }) {
  return (
    <div className="container-page">
      <div className="mx-auto max-w-lg py-14 text-center md:py-20">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#e8f4ee]">
          <CheckCircle2 className="size-10 text-success" strokeWidth={1.8} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-[-0.025em] md:text-3xl">Order placed — thank you!</h1>
        <p className="mt-2 text-[15px] text-muted">We’ve sent the confirmation to your phone and email.</p>
        <dl className="mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl bg-white py-4 text-sm ring-1 ring-line">
          <div>
            <dt className="text-xs text-muted">Order ID</dt>
            <dd className="mt-1 font-bold">{orderId}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Amount</dt>
            <dd className="mt-1 font-bold">{formatPrice(total)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Arrives by</dt>
            <dd className="mt-1 font-bold">{deliveryDate(5)}</dd>
          </div>
        </dl>
        <Link to="/shop" className={buttonClass('primary', 'lg', 'mt-8')}>
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
