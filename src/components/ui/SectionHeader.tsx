import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  linkTo?: string
  linkLabel?: string
  children?: ReactNode
}

export function SectionHeader({ eyebrow, title, linkTo, linkLabel = 'View all', children }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
      <div>
        {eyebrow && <p className="mb-1.5 text-xs font-bold tracking-[0.14em] text-rose-dark uppercase">{eyebrow}</p>}
        <h2 className="text-[22px] leading-tight font-extrabold tracking-[-0.02em] md:text-[30px]">{title}</h2>
      </div>
      {children}
      {linkTo && (
        <Link
          to={linkTo}
          className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-maroon hover:text-maroon-dark"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
