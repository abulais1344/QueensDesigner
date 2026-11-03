import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/format'
import { useBodyScrollLock } from '../../lib/hooks'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** bottom = sheet on mobile / centred dialog on desktop; left = drawer */
  side?: 'bottom' | 'left'
  className?: string
}

export function Sheet({ open, onClose, title, children, footer, side = 'bottom', className }: SheetProps) {
  const titleId = useId()
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]"
      />
      <div
        className={cn(
          'absolute flex max-h-[88dvh] flex-col bg-white shadow-sheet',
          side === 'bottom'
            ? 'inset-x-0 bottom-0 animate-sheet-up rounded-t-3xl pb-[env(safe-area-inset-bottom)] md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:animate-fade-in md:rounded-3xl md:pb-0'
            : 'inset-y-0 left-0 w-[86%] max-w-sm animate-slide-in max-h-none',
          className,
        )}
      >
        {side === 'bottom' && <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ink/15 md:hidden" aria-hidden />}
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid size-11 place-items-center rounded-full text-muted hover:bg-blush hover:text-ink"
            aria-label="Close"
            autoFocus
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-line bg-white px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
