# Queens Collection

Storefront for Queens Collection — Indian occasion wear (bridal, lehengas, suits, festive wear, sharara sets, party wear). React 19 + TypeScript, Vite, Tailwind CSS v4, React Router, Lucide icons. No backend yet: wishlist and bag persist to `localStorage`; products, stock, uploaded photos and orders persist to IndexedDB in the browser.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Home — hero, categories, best sellers, occasions, new arrivals, budget, bridal studio, reviews |
| `/shop` | Catalog with filters, search and sort. All state lives in the URL, e.g. `/shop?category=lehengas&size=M&sort=price-asc` |
| `/product/:id` | Product details — gallery, colour/size, delivery check, specs, similar styles |
| `/wishlist` | Saved items |
| `/bag` | Bag — quantity, coupon (`QUEEN10`), price summary, checkout form, place order |
| `/admin` | Admin (demo login) — dashboard, products, product editor, inventory & prices, orders |

## Admin

Sign in at `/admin` (or the footer's “Staff login”) with the demo account `admin@queenscollection.in` / `queens@2026` — the login page has a “Fill in for me” button.

- **Products** — search/filter, show or hide products in the store, add/edit/delete. The editor handles photos (upload, reorder, cover), details, colours, sizes with stock per size, price/MRP and badges.
- **Inventory & prices** — one table to edit price, MRP and stock for every size, saved in one go.
- **Orders** — every order placed from the storefront, with customer details and a status (New → Packed → Shipped → Delivered). Placing an order deducts stock; cancelling puts it back.
- **Dashboard** — revenue, new orders, items needing restock, and a “Reset demo data” button.

> **Demo only.** The login is checked in the browser and the data lives in that browser's IndexedDB, so it is not secure and other devices won't see changes. Moving to a real backend means replacing `src/lib/auth.ts` (sign-in) and the load/commit functions in `src/store/CatalogProvider.tsx` (data) — the pages only talk to `useCatalog()`.

## Structure

```
src/
  admin/       admin routes (lazy-loaded), layout, pages
  data/        products.ts (seed catalog), catalog.ts (categories, occasions, price bands, sort, size chart), photos.ts (image ids + URL builder)
  lib/         filters.ts, product.ts (stock & price helpers), db.ts (IndexedDB), auth.ts (demo login), images.ts, format.ts, ui.ts
  store/       catalog (products, stock, orders) and shopper state (wishlist, bag, toast) as React context
  components/  layout/ (header, mobile nav, search, footer), product/ (card, grid, rail, gallery, size picker, quick add), shop/ (filters), ui/
  pages/
```

Design tokens (palette, fonts, shadows, animations) are defined in `src/index.css` under `@theme` and used as Tailwind classes (`bg-maroon`, `text-rose-dark`, `bg-blush`, `font-display`…).

## Images

Seed product imagery is placeholder stock photography from Unsplash, referenced by id in `src/data/photos.ts`. Replace it with real shoots by uploading photos in the admin product editor (resized in the browser and stored with the product). Gallery detail views are crops of the main photo.
