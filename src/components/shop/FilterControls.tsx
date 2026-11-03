import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/format'

interface CheckOptionProps {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}

export function CheckOption({ label, count, checked, onChange }: CheckOptionProps) {
  const disabled = count === 0 && !checked
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-center gap-3 text-sm', disabled && 'cursor-default opacity-40')}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-maroon peer-focus-visible:ring-offset-2',
          checked ? 'border-maroon bg-maroon text-white' : 'border-ink/25 bg-white',
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className={cn('flex-1', checked && 'font-semibold')}>{label}</span>
      <span className="text-xs text-subtle">{count}</span>
    </label>
  )
}

interface RadioOptionProps {
  label: ReactNode
  checked: boolean
  onChange: () => void
}

/** Single-choice option that can be cleared by tapping it again. */
export function RadioOption({ label, checked, onChange }: RadioOptionProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-full border transition peer-focus-visible:ring-2 peer-focus-visible:ring-maroon peer-focus-visible:ring-offset-2',
          checked ? 'border-maroon' : 'border-ink/25 bg-white',
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-maroon" />}
      </span>
      <span className={cn(checked && 'font-semibold')}>{label}</span>
    </label>
  )
}
