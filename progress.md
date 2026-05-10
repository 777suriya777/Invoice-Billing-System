# InvoiceFlow Frontend — Progress Tracker

## Overview
Tracking UI/UX polish work for the `invoice-billing-system-frontend` Next.js app.
Goal: Transform the unstyled skeleton into a production-ready, professional UI using Tailwind CSS.

---

## Session 1 — 2026-05-09

### ✅ Completed

#### Infrastructure
- [x] Installed **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/postcss`, `postcss`)
- [x] Installed **lucide-react** for icons
- [x] Created `postcss.config.mjs` with `@tailwindcss/postcss` plugin
- [x] Updated `app/globals.css` — Tailwind CSS v4 `@import "tailwindcss"` + custom font theme token
- [x] Updated `app/layout.tsx` — Inter font via `next/font/google`, antialiased body, metadata updated to "InvoiceFlow"

#### Project Structure Refactor
Reorganised pages into **Next.js route groups** for clean layout separation:
```
app/
  (auth)/         ← login, register (no sidebar)
  (protected)/    ← all authenticated pages (with sidebar)
  components/     ← shared UI components
  layout.tsx      ← root layout
  page.tsx        ← redirects → /dashboard
```
Old flat page files removed to avoid route conflicts.

#### New / Redesigned Components
| File | Change |
|------|--------|
| `app/components/Sidebar.tsx` | **New** — fixed dark sidebar (slate-900) with brand logo, nav links (active = indigo), Sign Out button |
| `app/components/Badge.tsx` | **New** — status pill: Draft (gray), Sent (blue), Partially Paid (amber), Paid (green) |
| `app/components/ComboBox.tsx` | **Redesign** — full Tailwind styling, keyboard navigation, chevron icon, styled dropdown |
| `app/components/Invoice.tsx` | **Redesign** — compact summary row with status badge, outstanding amount highlight, hover "View →" link |

#### Redesigned Pages
| Page | Route | Key changes |
|------|-------|-------------|
| Login | `/login` | Gradient background, card with icon inputs, error alert, loading spinner |
| Register | `/register` | Two-column name row, same card design |
| Dashboard | `/dashboard` | 4 stat cards (total invoices, billed, revenue, outstanding), 3 invoice sections (unpaid/partial/paid) |
| Customer List | `/customer` | Avatar initials, icon columns, empty state, "Add Customer" CTA |
| New Customer | `/customer/new` | Card form with icon inputs, success + error states, Cancel/Create buttons |
| Invoice List | `/invoices` | Status filter tabs, clickable rows, outstanding amount colour-coded |
| New Invoice | `/invoices/new` | Two-column layout (client info left, line items right), ComboBox for customer/item selection, live grand total |
| Invoice Detail | `/invoices/[id]` | Client card, summary card, line items table, payment form, payment history table |
| Item List | `/item` | Package icon avatars, empty state |
| New Item | `/item/new` | Card form, textarea description, numeric price field |
| Protected Layout | `/` (all auth'd) | Sidebar + `pl-64` main content area |

### Design System
- **Primary colour:** Indigo (`indigo-500/600/700`)
- **Background:** `slate-50`
- **Cards:** `bg-white rounded-2xl border border-slate-200 shadow-sm`
- **Tables:** `divide-y divide-slate-50`, hover highlight rows
- **Inputs:** `rounded-xl` with icon prefix, indigo focus ring
- **Buttons:** `rounded-xl`, indigo primary / white secondary / green payment
- **Typography:** Inter (Google Font), slate-900 headings, slate-500 body

---

## Backlog / Next Session Ideas

- [ ] Add search/filter input to Customer and Item list pages
- [ ] Add pagination or infinite scroll for large invoice/customer lists
- [ ] Make sidebar collapsible on mobile (hamburger menu)
- [ ] Add toast notifications (instead of inline success/error states)
- [ ] Add confirmation modal before irreversible actions (e.g. Send Invoice)
- [ ] Dark mode support
- [ ] Loading skeletons (instead of spinner + text)
- [ ] Invoice print/PDF preview button on detail page
- [ ] Dashboard charts (e.g. revenue over time) using a charting library
- [ ] Breadcrumb navigation on nested pages
