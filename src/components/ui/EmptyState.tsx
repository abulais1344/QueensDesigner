import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center md:py-24">
      <div className="mb-5 grid size-20 place-items-center rounded-full bg-blush">
        <Icon className="size-9 text-maroon" strokeWidth={1.6} />
      </div>
      <h2 className="text-xl font-extrabold tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 text-[15px] text-muted">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
