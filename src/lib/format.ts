const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export function formatPrice(value: number) {
  return inr.format(value)
}

export function formatCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(value)
}

export function deliveryDate(daysFromNow: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
