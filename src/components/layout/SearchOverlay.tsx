import { ArrowLeft, ArrowUpRight, Search, TrendingUp, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { categories } from '../../data/catalog'
import { matchesQuery } from '../../lib/filters'
import { formatPrice } from '../../lib/format'
import { useBodyScrollLock } from '../../lib/hooks'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import { ProductImage } from '../ui/ProductImage'

const trending = ['Chikankari', 'Organza lehenga', 'Banarasi silk', 'Haldi', 'Velvet sharara', 'Anarkali']

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore()
  if (!searchOpen) return null
  return createPortal(<SearchPanel onClose={() => setSearchOpen(false)} />, document.body)
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const { visibleProducts: products } = useCatalog()
  const navigate = useNavigate()
  useBodyScrollLock(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => (query.trim() ? products.filter((p) => matchesQuery(p, query)).slice(0, 6) : []), [query, products])

  const submit = (q: string) => {
    onClose()
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" tabIndex={-1} aria-label="Close search" onClick={onClose} className="absolute inset-0 hidden animate-fade-in bg-ink/40 md:block" />
      <div className="relative flex h-full animate-fade-in flex-col bg-white md:h-auto md:max-h-[80dvh] md:rounded-b-3xl md:shadow-sheet">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) submit(query)
          }}
          className="container-page flex items-center gap-2 border-b border-line py-3 md:py-5"
        >
          <button type="button" onClick={onClose} className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-blush md:hidden" aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
          <label className="flex h-12 flex-1 items-center gap-3 rounded-full border border-line bg-ivory px-4 focus-within:border-maroon focus-within:bg-white">
            <Search className="size-5 shrink-0 text-muted" />
            <input
              autoFocus
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for lehengas, sarees, colours…"
              className="h-full w-full bg-transparent text-base outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="grid size-8 place-items-center rounded-full text-muted hover:bg-blush">
                <X className="size-4" />
              </button>
            )}
          </label>
          <button type="button" onClick={onClose} className="hidden h-12 rounded-full px-4 text-sm font-semibold text-muted hover:text-ink md:block">
            Cancel
          </button>
        </form>

        <div className="flex-1 overflow-y-auto">
          <div className="container-page py-5">
            {query.trim() ? (
              results.length ? (
                <>
                  <ul className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-x-6">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.id}`} onClick={onClose} className="flex items-center gap-3.5 rounded-2xl p-2 hover:bg-ivory">
                          <ProductImage photo={p.photos[0]} alt="" sizes="64px" className="aspect-[4/5] w-14 shrink-0 rounded-xl" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                            <span className="block text-xs text-muted">{p.category}</span>
                          </span>
                          <span className="shrink-0 text-sm font-bold whitespace-nowrap">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => submit(query)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blush text-sm font-semibold text-maroon hover:bg-blush-deep">
                    See all results for “{query.trim()}” <ArrowUpRight className="size-4" />
                  </button>
                </>
              ) : (
                <p className="py-10 text-center text-muted">
                  No matches for “{query.trim()}”. Try a colour, fabric or occasion.
                </p>
              )
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-muted uppercase">
                    <TrendingUp className="size-4" /> Trending searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <button key={t} type="button" onClick={() => submit(t)} className="h-10 rounded-full border border-line px-4 text-sm font-medium hover:border-maroon hover:text-maroon">
                        {t}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-xs font-bold tracking-[0.12em] text-muted uppercase">Shop by category</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((c) => (
                      <Link key={c.slug} to={`/shop?category=${c.slug}`} onClick={onClose} className="group text-center">
                        <ProductImage photo={c.photo} alt="" sizes="120px" ratio={1} className="aspect-square rounded-2xl" />
                        <span className="mt-1.5 block text-xs font-semibold group-hover:text-maroon">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
