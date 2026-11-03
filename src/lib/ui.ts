import { cn } from './format'

type Variant = 'primary' | 'outline' | 'soft' | 'ghost' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-maroon text-white hover:bg-maroon-dark shadow-[0_6px_16px_rgb(110_21_48/0.22)]',
  outline: 'border border-ink/15 bg-white text-ink hover:border-maroon hover:text-maroon',
  soft: 'bg-blush text-maroon hover:bg-blush-deep',
  ghost: 'text-ink hover:bg-blush/70',
  dark: 'bg-ink text-white hover:bg-black',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[background,color,border-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100',
    variants[variant],
    sizes[size],
    extra,
  )
}
