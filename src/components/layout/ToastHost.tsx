import { CheckCircle2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/store'

export function ToastHost() {
  const { toast, dismissToast } = useStore()
  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 md:bottom-8">
      <div
        key={toast.id}
        role="status"
        className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-2xl bg-ink py-2 pr-2 pl-4 text-sm text-white shadow-lift"
      >
        <CheckCircle2 className="size-5 shrink-0 text-[#7fd1a8]" />
        <span className="flex-1 font-medium">{toast.message}</span>
        {toast.action && (
          <Link
            to={toast.action.to}
            onClick={dismissToast}
            className="rounded-full px-3 py-2 text-sm font-bold text-blush-deep hover:bg-white/10"
          >
            {toast.action.label}
          </Link>
        )}
        <button type="button" onClick={dismissToast} aria-label="Dismiss" className="grid size-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
