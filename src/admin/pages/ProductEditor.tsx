import { ArrowLeft, ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductImage } from '../../components/ui/ProductImage'
import { Sheet } from '../../components/ui/Sheet'
import { categories, occasions, sizeOrder } from '../../data/catalog'
import { cn, formatPrice } from '../../lib/format'
import { compressImage } from '../../lib/images'
import { discountPercent, slugify } from '../../lib/product'
import { buttonClass } from '../../lib/ui'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import type { Category, ColorOption, Occasion, Photo, Product, Size } from '../../types'
import { AdminPage, Field, inputClass, Panel, Toggle } from '../components'

const MAX_PHOTOS = 8

/** Form state: numbers are kept as strings so inputs can be cleared while typing. */
interface Draft {
  name: string
  subtitle: string
  category: Category
  occasion: Occasion
  description: string
  highlights: string
  price: string
  mrp: string
  sizes: Size[]
  stock: Record<Size, string>
  colors: ColorOption[]
  fabric: string
  work: string
  setIncludes: string
  photos: Photo[]
  hidden: boolean
  isNew: boolean
  isBestseller: boolean
}

type Errors = Partial<Record<keyof Draft, string>>

function toDraft(p?: Product): Draft {
  const stock = Object.fromEntries(sizeOrder.map((s) => [s, String(p?.stock[s] ?? 0)])) as Record<Size, string>
  return {
    name: p?.name ?? '',
    subtitle: p?.subtitle ?? '',
    category: p?.category ?? 'Lehengas',
    occasion: p?.occasion ?? 'Festive',
    description: p?.description ?? '',
    highlights: p?.highlights.join('\n') ?? '',
    price: p ? String(p.price) : '',
    mrp: p ? String(p.mrp) : '',
    sizes: p?.sizes ?? ['S', 'M', 'L', 'XL'],
    stock,
    colors: p?.colors ?? [{ name: '', hex: '#6E1530' }],
    fabric: p?.fabric ?? '',
    work: p?.work ?? '',
    setIncludes: p?.setIncludes ?? '',
    photos: p?.photos ?? [],
    hidden: p?.hidden ?? false,
    isNew: p?.isNew ?? !p,
    isBestseller: p?.isBestseller ?? false,
  }
}

function validate(d: Draft): Errors {
  const errors: Errors = {}
  const price = Number(d.price)
  const mrp = Number(d.mrp)
  if (!d.name.trim()) errors.name = 'Enter a product name'
  if (!d.subtitle.trim()) errors.subtitle = 'Add a short one-line summary'
  if (!d.description.trim()) errors.description = 'Add a description'
  if (!d.photos.length) errors.photos = 'Add at least one photo'
  if (!(price > 0)) errors.price = 'Enter a selling price'
  if (!(mrp > 0)) errors.mrp = 'Enter the MRP'
  else if (mrp < price) errors.mrp = 'MRP can’t be lower than the selling price'
  if (!d.sizes.length) errors.sizes = 'Offer at least one size'
  else if (d.sizes.some((s) => !Number.isInteger(Number(d.stock[s])) || Number(d.stock[s]) < 0))
    errors.stock = 'Stock must be a whole number, 0 or more'
  if (!d.colors.length || d.colors.some((c) => !c.name.trim())) errors.colors = 'Every colour needs a name'
  return errors
}

// Keyed by id so switching between products (or to “new”) starts with a fresh form.
export default function ProductEditorRoute() {
  const { productId } = useParams()
  return <ProductEditor key={productId ?? 'new'} productId={productId} />
}

function ProductEditor({ productId }: { productId?: string }) {
  const { products, saveProduct, deleteProduct } = useCatalog()
  const { showToast } = useStore()
  const navigate = useNavigate()
  const existing = productId ? products.find((p) => p.id === productId) : undefined
  const [draft, setDraft] = useState(() => toDraft(existing))
  const [errors, setErrors] = useState<Errors>({})
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  if (productId && !existing) {
    return (
      <AdminPage title="Product not found">
        <p className="text-muted">It may have been deleted.</p>
        <Link to="/admin/products" className={buttonClass('primary', 'sm', 'mt-4')}>
          Back to products
        </Link>
      </AdminPage>
    )
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - draft.photos.length)
    e.target.value = ''
    setUploading(files.length)
    for (const file of files) {
      try {
        const src = await compressImage(file)
        setDraft((d) => ({ ...d, photos: [...d.photos, { src }] }))
        setErrors((er) => ({ ...er, photos: undefined }))
      } catch (err) {
        showToast(err instanceof Error ? err.message : `Couldn’t read ${file.name}`)
      }
      setUploading((n) => n - 1)
    }
  }

  const movePhoto = (index: number, by: -1 | 1) => {
    const photos = [...draft.photos]
    ;[photos[index], photos[index + by]] = [photos[index + by], photos[index]]
    set('photos', photos)
  }

  const save = async () => {
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    let id = existing?.id ?? (slugify(draft.name) || 'product')
    if (!existing) {
      const base = id
      for (let n = 2; products.some((p) => p.id === id); n++) id = `${base}-${n}`
    }
    const product: Product = {
      id,
      name: draft.name.trim(),
      subtitle: draft.subtitle.trim(),
      category: draft.category,
      occasion: draft.occasion,
      description: draft.description.trim(),
      highlights: draft.highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      price: Number(draft.price),
      mrp: Number(draft.mrp),
      sizes: sizeOrder.filter((s) => draft.sizes.includes(s)),
      stock: Object.fromEntries(draft.sizes.map((s) => [s, Number(draft.stock[s])])),
      colors: draft.colors.map((c) => ({ ...c, name: c.name.trim() })),
      fabric: draft.fabric.trim(),
      work: draft.work.trim(),
      setIncludes: draft.setIncludes.trim(),
      photos: draft.photos,
      hidden: draft.hidden,
      isNew: draft.isNew,
      isBestseller: draft.isBestseller,
      rating: existing?.rating ?? 0,
      reviews: existing?.reviews ?? 0,
      rank: existing?.rank ?? Math.max(0, ...products.map((p) => p.rank)) + 1,
      arrival: existing?.arrival ?? Math.max(0, ...products.map((p) => p.arrival)) + 1,
    }
    try {
      await saveProduct(product)
      showToast(existing ? 'Product updated' : 'Product added', { label: 'View in store', to: `/product/${id}` })
      navigate('/admin/products')
    } catch {
      showToast('Couldn’t save — browser storage may be full. Try removing some photos.')
      setSaving(false)
    }
  }

  const errorCount = Object.values(errors).filter(Boolean).length
  const off = discountPercent({ price: Number(draft.price) || 0, mrp: Number(draft.mrp) || 0 })

  return (
    <AdminPage
      title={existing ? 'Edit product' : 'Add product'}
      description={existing?.name}
      actions={
        <Link to="/admin/products" className={buttonClass('ghost', 'sm')}>
          <ArrowLeft className="size-4" /> All products
        </Link>
      }
    >
      {errorCount > 0 && (
        <p role="alert" className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm font-semibold text-rose-dark">
          Please fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} below before saving.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Panel title="Photos">
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {draft.photos.map((photo, i) => (
                  <div key={i} className="group relative">
                    <ProductImage photo={photo} alt={`Photo ${i + 1}`} sizes="160px" className="aspect-[4/5] rounded-xl ring-1 ring-line" />
                    {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Cover</span>}
                    <button
                      type="button"
                      onClick={() => set('photos', draft.photos.filter((_, j) => j !== i))}
                      aria-label={`Remove photo ${i + 1}`}
                      className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm hover:text-rose-dark"
                    >
                      <X className="size-4" />
                    </button>
                    <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                      <button type="button" disabled={i === 0} onClick={() => movePhoto(i, -1)} aria-label="Move earlier" className="grid size-8 place-items-center rounded-full bg-white/95 shadow-sm disabled:invisible">
                        <ChevronLeft className="size-4" />
                      </button>
                      <button type="button" disabled={i === draft.photos.length - 1} onClick={() => movePhoto(i, 1)} aria-label="Move later" className="grid size-8 place-items-center rounded-full bg-white/95 shadow-sm disabled:invisible">
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {Array.from({ length: uploading }, (_, i) => (
                  <div key={`up-${i}`} className="grid aspect-[4/5] place-items-center rounded-xl bg-blush">
                    <Loader2 className="size-6 animate-spin text-maroon" />
                  </div>
                ))}
                {draft.photos.length + uploading < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className={cn(
                      'flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm font-semibold transition hover:border-maroon hover:text-maroon',
                      errors.photos ? 'border-rose-dark text-rose-dark' : 'border-line text-muted',
                    )}
                  >
                    <ImagePlus className="size-6" />
                    Add photos
                  </button>
                )}
              </div>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
              <p className={cn('mt-3 text-xs', errors.photos ? 'font-semibold text-rose-dark' : 'text-muted')}>
                {errors.photos ?? `Up to ${MAX_PHOTOS} photos. The first is the cover. Portrait (4:5) shots look best; photos are resized automatically.`}
              </p>
            </div>
          </Panel>

          <Panel title="Details">
            <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
              <div className="md:col-span-2">
                <Field label="Product name" error={errors.name}>
                  <input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rani Pink Banarasi Lehenga" className={inputClass} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="One-line summary" error={errors.subtitle} hint="Shown under the name on the product page">
                  <input value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="e.g. Handwoven silk with zari border" className={inputClass} />
                </Field>
              </div>
              <Field label="Category">
                <select value={draft.category} onChange={(e) => set('category', e.target.value as Category)} className={inputClass}>
                  {categories.map((c) => (
                    <option key={c.slug}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Occasion">
                <select value={draft.occasion} onChange={(e) => set('occasion', e.target.value as Occasion)} className={inputClass}>
                  {occasions.map((o) => (
                    <option key={o.name}>{o.name}</option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description" error={errors.description}>
                  <textarea value={draft.description} onChange={(e) => set('description', e.target.value)} rows={4} className={cn(inputClass, 'h-auto py-3')} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Highlights" hint="One per line, e.g. “Ready to ship in 48 hours”">
                  <textarea value={draft.highlights} onChange={(e) => set('highlights', e.target.value)} rows={3} className={cn(inputClass, 'h-auto py-3')} />
                </Field>
              </div>
              <Field label="Fabric">
                <input value={draft.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. Pure Banarasi silk" className={inputClass} />
              </Field>
              <Field label="Work / embroidery">
                <input value={draft.work} onChange={(e) => set('work', e.target.value)} placeholder="e.g. Zari & dabka handwork" className={inputClass} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Set includes">
                  <input value={draft.setIncludes} onChange={(e) => set('setIncludes', e.target.value)} placeholder="e.g. Lehenga, blouse, dupatta" className={inputClass} />
                </Field>
              </div>
            </div>
          </Panel>

          <Panel title="Sizes & stock">
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sizeOrder.map((size) => {
                  const offered = draft.sizes.includes(size)
                  return (
                    <div key={size} className={cn('flex items-center gap-3 rounded-xl border p-2.5', offered ? 'border-line bg-white' : 'border-dashed border-line bg-ivory')}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={offered}
                          onChange={() => set('sizes', offered ? draft.sizes.filter((s) => s !== size) : [...draft.sizes, size])}
                          className="size-4 accent-maroon"
                        />
                        <span className="w-8">{size}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        disabled={!offered}
                        value={offered ? draft.stock[size] : ''}
                        onChange={(e) => set('stock', { ...draft.stock, [size]: e.target.value })}
                        aria-label={`Stock for size ${size}`}
                        placeholder="—"
                        className={cn(inputClass, 'h-10 text-right')}
                      />
                    </div>
                  )
                })}
              </div>
              {(errors.sizes || errors.stock) && <p className="mt-3 text-xs font-semibold text-rose-dark">{errors.sizes ?? errors.stock}</p>}
              <p className="mt-3 text-xs text-muted">
                Sizes with 0 stock show as sold out. Total {draft.sizes.reduce((n, s) => n + (Number(draft.stock[s]) || 0), 0)} units.
              </p>
            </div>
          </Panel>

          <Panel title="Colours">
            <div className="space-y-2.5 p-4 md:p-5">
              {draft.colors.map((color, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => set('colors', draft.colors.map((c, j) => (j === i ? { ...c, hex: e.target.value } : c)))}
                    aria-label={`Swatch for colour ${i + 1}`}
                    className="size-11 shrink-0 cursor-pointer rounded-xl border border-line bg-white p-1"
                  />
                  <input
                    value={color.name}
                    onChange={(e) => set('colors', draft.colors.map((c, j) => (j === i ? { ...c, name: e.target.value } : c)))}
                    placeholder="Colour name, e.g. Rani Pink"
                    aria-label={`Name for colour ${i + 1}`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={draft.colors.length === 1}
                    onClick={() => set('colors', draft.colors.filter((_, j) => j !== i))}
                    aria-label={`Remove colour ${i + 1}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-blush hover:text-rose-dark disabled:opacity-30"
                  >
                    <Trash2 className="size-[18px]" />
                  </button>
                </div>
              ))}
              {errors.colors && <p className="text-xs font-semibold text-rose-dark">{errors.colors}</p>}
              <button type="button" onClick={() => set('colors', [...draft.colors, { name: '', hex: '#B76E7C' }])} className={buttonClass('soft', 'sm')}>
                <Plus className="size-4" /> Add colour
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Panel title="Pricing">
            <div className="grid grid-cols-2 gap-3 p-4 md:p-5">
              <Field label="Selling price (₹)" error={errors.price}>
                <input type="number" min={1} inputMode="numeric" value={draft.price} onChange={(e) => set('price', e.target.value)} className={inputClass} />
              </Field>
              <Field label="MRP (₹)" error={errors.mrp}>
                <input type="number" min={1} inputMode="numeric" value={draft.mrp} onChange={(e) => set('mrp', e.target.value)} className={inputClass} />
              </Field>
              <p className="col-span-2 text-sm text-muted">
                {off > 0 ? (
                  <>
                    Customers see <strong className="text-rose-dark">{off}% OFF</strong>, saving {formatPrice(Number(draft.mrp) - Number(draft.price))}
                  </>
                ) : (
                  'Set MRP above the price to show a discount.'
                )}
              </p>
            </div>
          </Panel>

          <Panel title="Visibility">
            <div className="divide-y divide-line">
              {(
                [
                  ['hidden', 'Live in store', 'Hidden products stay here but customers can’t see or buy them'],
                  ['isNew', 'New arrival', 'Shows a “New” badge'],
                  ['isBestseller', 'Bestseller', 'Shows a badge and features it on the homepage'],
                ] as const
              ).map(([key, label, hint]) => (
                <div key={key} className="flex items-center gap-3 px-4 py-3.5 md:px-5">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted">{hint}</p>
                  </div>
                  <Toggle
                    checked={key === 'hidden' ? !draft.hidden : draft[key]}
                    onChange={(v) => set(key, key === 'hidden' ? !v : v)}
                    label={label}
                  />
                </div>
              ))}
            </div>
          </Panel>

          {existing && (
            <button type="button" onClick={() => setConfirmDelete(true)} className={buttonClass('ghost', 'sm', 'w-full text-rose-dark hover:bg-blush')}>
              <Trash2 className="size-4" /> Delete product
            </button>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:left-[248px]">
        <div className="mx-auto flex max-w-6xl justify-end gap-3 md:px-4">
          <Link to="/admin/products" className={buttonClass('outline', 'md', 'flex-1 sm:flex-none')}>
            Cancel
          </Link>
          <button type="button" onClick={save} disabled={saving || uploading > 0} className={buttonClass('primary', 'md', 'flex-[2] sm:flex-none sm:px-10')}>
            {saving ? 'Saving…' : existing ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this product?">
        <div className="space-y-5 px-5 py-5">
          <p className="text-[15px] text-muted">
            <strong className="text-ink">{existing?.name}</strong> will be removed from the store and admin. Past orders keep their details. To take it
            off sale temporarily, switch off “Live in store” instead.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setConfirmDelete(false)} className={buttonClass('outline', 'md', 'flex-1')}>
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                await deleteProduct(existing!.id)
                showToast('Product deleted')
                navigate('/admin/products')
              }}
              className={buttonClass('primary', 'md', 'flex-1')}
            >
              Delete
            </button>
          </div>
        </div>
      </Sheet>
    </AdminPage>
  )
}
