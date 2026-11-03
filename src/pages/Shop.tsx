import { ArrowUpDown, Check, ChevronDown, ChevronRight, Search, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { buildFilterSections } from '../components/shop/filterSections'
import { EmptyState } from '../components/ui/EmptyState'
import { Sheet } from '../components/ui/Sheet'
import { categories, occasions, priceBands, sortOptions } from '../data/catalog'
import { applyFilters, countActiveFilters, filtersToParams, parseFilters, sortProducts, type Filters } from '../lib/filters'
import { cn } from '../lib/format'
import { buttonClass } from '../lib/ui'
import { useCatalog } from '../store/catalog'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const { visibleProducts: products } = useCatalog()
  const filters = useMemo(() => parseFilters(params), [params])
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const update = (patch: Partial<Filters>, replace = false) =>
    setParams(filtersToParams({ ...filters, ...patch }), { replace, preventScrollReset: true })

  const clearAll = () => update({ categories: [], prices: [], sizes: [], occasions: [], minDiscount: 0, minRating: 0 })

  const results = useMemo(() => sortProducts(applyFilters(products, filters), filters.sort), [products, filters])
  const sections = buildFilterSections(products, filters, update)
  const activeCount = countActiveFilters(filters)

  const single = filters.categories.length === 1 ? categories.find((c) => c.name === filters.categories[0]) : undefined
  const title = filters.q
    ? `Results for “${filters.q}”`
    : single
      ? single.name
      : filters.occasions.length === 1
        ? `${filters.occasions[0]} edit`
        : filters.sort === 'new' && !activeCount
          ? 'New arrivals'
          : 'All products'

  return (
    <div className="container-page pt-4 pb-4 md:pt-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
        <Link to="/" className="hover:text-maroon">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/shop" className="hover:text-maroon">
          Shop
        </Link>
        {single && (
          <>
            <ChevronRight className="size-3.5" />
            <span className="font-semibold text-ink">{single.name}</span>
          </>
        )}
      </nav>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-extrabold tracking-[-0.025em] md:text-[32px]">{title}</h1>
        <p className="text-sm text-muted">
          {results.length} {results.length === 1 ? 'style' : 'styles'}
        </p>
      </div>
      {single && <p className="mt-1 hidden text-sm text-muted md:block">{single.blurb}</p>}

      {/* Mobile: category chips */}
      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
        <Chip active={!filters.categories.length} onClick={() => update({ categories: [] })}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.slug} active={filters.categories.length === 1 && filters.categories[0] === c.name} onClick={() => update({ categories: [c.name] })}>
            {c.name}
          </Chip>
        ))}
      </div>

      {/* Mobile: sticky sort / filter bar */}
      <div className="sticky top-16 z-30 -mx-4 mt-3 grid grid-cols-2 border-y border-line bg-white/95 backdrop-blur-md lg:hidden">
        <button type="button" onClick={() => setSortOpen(true)} className="flex h-12 items-center justify-center gap-2 border-r border-line text-sm font-semibold">
          <ArrowUpDown className="size-4" />
          Sort
          {filters.sort !== 'recommended' && <span className="size-1.5 rounded-full bg-maroon" />}
        </button>
        <button type="button" onClick={() => setFilterOpen(true)} className="flex h-12 items-center justify-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" />
          Filter
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-maroon px-1 text-[11px] text-white">{activeCount}</span>
          )}
        </button>
      </div>

      <div className="mt-4 grid gap-8 md:mt-6 lg:grid-cols-[248px_1fr] xl:grid-cols-[264px_1fr]">
        {/* Desktop filter sidebar */}
        <aside aria-label="Filters" className="hidden self-start lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-2">
          <div className="flex h-11 items-center justify-between">
            <h2 className="text-sm font-extrabold tracking-[0.1em] uppercase">Filters</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-maroon hover:underline">
                Clear all
              </button>
            )}
          </div>
          {sections.map((s) => (
            <details key={s.id} open className="group border-t border-line py-2">
              <summary className="flex h-11 cursor-pointer list-none items-center justify-between text-[15px] font-bold [&::-webkit-details-marker]:hidden">
                {s.label}
                <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-2">{s.content}</div>
            </details>
          ))}
        </aside>

        <section aria-label="Products" className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center">
            <label className="flex h-12 w-full items-center gap-2.5 rounded-full md:flex-1 border border-line bg-white px-4 focus-within:border-maroon">
              <Search className="size-[18px] shrink-0 text-muted" />
              <input
                type="search"
                value={filters.q}
                onChange={(e) => update({ q: e.target.value }, true)}
                placeholder="Search within the collection"
                aria-label="Search products"
                className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
              />
              {filters.q && (
                <button type="button" onClick={() => update({ q: '' })} aria-label="Clear search" className="grid size-8 place-items-center rounded-full text-muted hover:bg-blush">
                  <X className="size-4" />
                </button>
              )}
            </label>
            <label className="relative hidden items-center gap-2 lg:flex">
              <span className="text-sm whitespace-nowrap text-muted">Sort by</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}
                className="h-12 appearance-none rounded-full border border-line bg-white pr-10 pl-4 text-sm font-semibold outline-none hover:border-ink/30 focus:border-maroon"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 size-4 text-muted" />
            </label>
          </div>

          <AppliedFilters filters={filters} update={update} clearAll={clearAll} />

          {results.length ? (
            <ProductGrid products={results} columns={3} eagerCount={4} />
          ) : (
            <EmptyState
              icon={SearchX}
              title="No styles match those filters"
              message="Try removing a filter or searching for a colour, fabric or occasion instead."
              action={
                <button type="button" onClick={() => update({ q: '', categories: [], prices: [], sizes: [], occasions: [], minDiscount: 0, minRating: 0 })} className={buttonClass('primary')}>
                  Clear all filters
                </button>
              }
            />
          )}

          {results.length > 0 && (
            <p className="mt-10 text-center text-sm text-muted">
              You’ve seen all {results.length} {results.length === 1 ? 'style' : 'styles'}
            </p>
          )}
        </section>
      </div>

      <MobileFilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} sections={sections} resultCount={results.length} clearAll={clearAll} />

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <ul className="py-2">
          {sortOptions.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => {
                  update({ sort: o.id })
                  setSortOpen(false)
                }}
                className={cn('flex h-13 w-full items-center justify-between px-5 text-[15px]', filters.sort === o.id ? 'font-bold text-maroon' : 'text-ink')}
              >
                {o.label}
                {filters.sort === o.id && <Check className="size-5" />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition',
        active ? 'border-maroon bg-maroon text-white' : 'border-line bg-white text-ink',
      )}
    >
      {children}
    </button>
  )
}

interface AppliedFiltersProps {
  filters: Filters
  update: (patch: Partial<Filters>) => void
  clearAll: () => void
}

function AppliedFilters({ filters, update, clearAll }: AppliedFiltersProps) {
  const chips = [
    ...filters.categories.map((c) => ({ label: c, remove: () => update({ categories: filters.categories.filter((x) => x !== c) }) })),
    ...filters.prices.map((id) => ({
      label: priceBands.find((b) => b.id === id)?.label ?? id,
      remove: () => update({ prices: filters.prices.filter((x) => x !== id) }),
    })),
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, remove: () => update({ sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...filters.occasions
      .filter((o) => occasions.some((x) => x.name === o))
      .map((o) => ({ label: o, remove: () => update({ occasions: filters.occasions.filter((x) => x !== o) }) })),
    ...(filters.minDiscount ? [{ label: `${filters.minDiscount}%+ off`, remove: () => update({ minDiscount: 0 }) }] : []),
    ...(filters.minRating ? [{ label: `${filters.minRating}★ & above`, remove: () => update({ minRating: 0 }) }] : []),
  ]
  if (!chips.length) return null

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.remove}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blush pr-2.5 pl-3.5 text-[13px] font-semibold text-maroon hover:bg-blush-deep"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="h-9 px-2 text-[13px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline">
        Clear all
      </button>
    </div>
  )
}

interface MobileFilterSheetProps {
  open: boolean
  onClose: () => void
  sections: ReturnType<typeof buildFilterSections>
  resultCount: number
  clearAll: () => void
}

function MobileFilterSheet({ open, onClose, sections, resultCount, clearAll }: MobileFilterSheetProps) {
  const [tab, setTab] = useState(sections[0].id)
  const current = sections.find((s) => s.id === tab) ?? sections[0]

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      className="h-[85dvh] md:h-[70dvh]"
      footer={
        <div className="flex gap-3">
          <button type="button" onClick={clearAll} className={buttonClass('outline', 'md', 'flex-1')}>
            Clear all
          </button>
          <button type="button" onClick={onClose} className={buttonClass('primary', 'md', 'flex-[1.4]')}>
            Show {resultCount} {resultCount === 1 ? 'style' : 'styles'}
          </button>
        </div>
      }
    >
      <div className="grid h-full grid-cols-[38%_1fr]">
        <div role="tablist" aria-orientation="vertical" className="bg-ivory">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={tab === s.id}
              onClick={() => setTab(s.id)}
              className={cn(
                'flex min-h-13 w-full items-center justify-between border-l-[3px] px-4 text-left text-sm font-semibold',
                tab === s.id ? 'border-maroon bg-white text-maroon' : 'border-transparent text-ink',
              )}
            >
              {s.label}
              {s.activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-maroon text-[11px] text-white">{s.activeCount}</span>}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="overflow-y-auto px-4 py-2">
          {current.content}
        </div>
      </div>
    </Sheet>
  )
}
