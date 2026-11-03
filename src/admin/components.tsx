import type { ReactNode } from 'react'
import { cn } from '../lib/format'
import type { OrderStatus } from '../types'

export function AdminPage({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-8 md:py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.025em] md:text-[28px]">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Panel({ title, action, className, children }: { title?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-2xl bg-white ring-1 ring-line', className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 md:px-5">
          <h2 className="text-[15px] font-bold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

const statusTone: Record<OrderStatus, string> = {
  New: 'bg-blush text-maroon',
  Packed: 'bg-gold-soft text-[#7a5a22]',
  Shipped: 'bg-[#e4ecf7] text-[#2c4f86]',
  Delivered: 'bg-[#e8f4ee] text-success',
  Cancelled: 'bg-ink/8 text-muted',
}

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', statusTone[status])}>{status}</span>
}

export function StockPill({ total }: { total: number }) {
  if (total === 0) return <span className="inline-flex rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">Out of stock</span>
  if (total <= 5) return <span className="inline-flex rounded-full bg-blush px-2.5 py-1 text-xs font-bold text-maroon">Low · {total}</span>
  return <span className="text-sm font-semibold">{total} in stock</span>
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-success' : 'bg-ink/20')}
    >
      <span className={cn('absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
    </button>
  )
}

export const inputClass =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none placeholder:text-subtle focus:border-maroon disabled:bg-ivory disabled:text-subtle'

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-dark">{error}</span> : hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}
