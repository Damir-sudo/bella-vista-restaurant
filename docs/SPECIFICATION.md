# Bella Vista — Project Specification

> Premium Italian restaurant platform with online ordering, customer accounts, reviews, order tracking, and a full admin back-office.

**Document status:** v1.0 (Phase 1 — Specification & Structure)
**Last updated:** 2026-05-31

---

## 1. Product Overview

Bella Vista is a production-grade web platform for an upscale Italian restaurant. It serves two
audiences from a single codebase:

1. **Customers** — browse the menu, filter and search dishes, add items to a cart, register/log in,
   check out, track their orders, and leave reviews.
2. **Staff / Admins** — manage menu items, categories, orders, and users, and view sales analytics
   from a protected dashboard.

### 1.1 Goals

- Deliver a **luxury, editorial visual identity** that reads as a high-end restaurant brand.
- Be **fully responsive** (mobile-first) and ship a polished **dark mode**.
- Be **production-ready**: typed end-to-end, validated inputs, secure auth, sensible error handling,
  and a seedable database.
- Keep the architecture **conventional and maintainable** so a team can extend it.

### 1.2 Non-Goals (v1)

- Real payment capture (we model the checkout + order lifecycle; a `PaymentIntent` stub is provided
  with a clear integration seam for Stripe).
- Multi-restaurant / franchise tenancy.
- Native mobile apps (the web app is responsive/PWA-friendly).
- Real-time kitchen display systems (order status is polled/refreshed, not socket-pushed in v1).

---

## 2. Technology Stack

| Layer            | Choice                                   | Rationale |
|------------------|------------------------------------------|-----------|
| Framework        | **Next.js 14 (App Router)**              | Server Components, route handlers, SSR/ISR, file-based routing. |
| Language         | **TypeScript (strict)**                  | End-to-end type safety. |
| Styling          | **Tailwind CSS** + CSS variables         | Utility-first, theme tokens, dark mode via `class` strategy. |
| UI primitives    | Radix UI + custom components             | Accessible, unstyled primitives we skin to the brand. |
| Database         | **PostgreSQL**                           | Relational integrity for orders, items, users. |
| ORM              | **Prisma**                               | Typed queries, migrations, seeding. |
| Auth             | **NextAuth (Auth.js) v5** Credentials    | Session + JWT, role-based (`CUSTOMER` / `ADMIN`). |
| Validation       | **Zod**                                  | Shared schemas for forms + API. |
| Forms            | React Hook Form + Zod resolver           | Performant, accessible forms. |
| Client state     | **Zustand** (cart) + React Query (server)| Lightweight cart store; cached server state. |
| Icons            | lucide-react                             | Consistent line icons. |
| Animation        | Framer Motion                            | Tasteful micro-interactions. |
| Charts           | Recharts                                 | Admin analytics. |
| Email (stub)     | Nodemailer / Resend seam                 | Order confirmation hooks. |
| Testing          | Vitest + Testing Library + Playwright    | Unit/integration + e2e. |
| Tooling          | ESLint, Prettier, Husky, lint-staged     | Quality gates. |

> **Environment note:** This sandbox blocks the public npm registry, so dependencies cannot be
> installed here. All config and source files are authored to run with a standard
> `npm install && npx prisma migrate dev && npm run dev` in an environment with registry access.

---

## 3. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser (Client)                       │
│  React Server/Client Components · Tailwind · Zustand cart      │
└───────────────▲───────────────────────────────▲───────────────┘
                │ HTML/RSC payload               │ fetch (JSON)
┌───────────────┴───────────────────────────────┴───────────────┐
│                     Next.js App Router (Node)                  │
│  ┌───────────────┐   ┌───────────────┐   ┌──────────────────┐ │
│  │ Server Comps  │   │ Route Handlers│   │ Server Actions    │ │
│  │ (pages, data) │   │ (/api/*)      │   │ (mutations)       │ │
│  └──────┬────────┘   └──────┬────────┘   └────────┬─────────┘ │
│         │  NextAuth session/role guard            │           │
│  ┌──────┴───────────────────────────────────────-┴────────┐  │
│  │                 Service / data-access layer             │  │
│  │            (lib/services/*, Zod validation)             │  │
│  └───────────────────────────┬─────────────────────────────┘ │
└──────────────────────────────┼───────────────────────────────┘
                               │ Prisma Client
                     ┌─────────┴──────────┐
                     │   PostgreSQL DB     │
                     └────────────────────┘
```

**Principles**

- **Server Components by default**; mark interactive leaves as Client Components.
- **Data access only on the server** (route handlers, server actions, server components) through a
  thin **service layer** (`lib/services/*`) so business rules live in one place.
- **Validation at the boundary** with shared Zod schemas (`lib/validations/*`) reused by forms and APIs.
- **Auth & role checks** centralized in `lib/auth` + middleware for `/admin/**` and `/account/**`.

---

## 4. Data Model (Prisma)

Core entities and relationships. Full schema lives in `prisma/schema.prisma`.

```
User 1───* Address
User 1───* Order
User 1───* Review
User 1───* CartItem (optional persisted cart)

Category 1───* MenuItem
MenuItem 1───* OrderItem
MenuItem 1───* Review
MenuItem 1───* CartItem

Order 1───* OrderItem
Order 1───1 Address (snapshot via embedded fields)
Order 1───* OrderStatusEvent  (status history / tracking timeline)
```

### 4.1 Entities

- **User** — `id, name, email (unique), passwordHash, role (CUSTOMER|ADMIN), phone, image, createdAt`.
- **Address** — `id, userId, label, line1, line2, city, postalCode, country, isDefault`.
- **Category** — `id, name, slug (unique), description, image, sortOrder, isActive`.
- **MenuItem** — `id, name, slug (unique), description, price (Decimal), image, categoryId,
  isAvailable, isFeatured, isVegetarian, isVegan, isGlutenFree, spiceLevel, calories, prepTimeMin,
  rating (derived), createdAt`.
- **Order** — `id, orderNumber (unique), userId, status (enum), type (DELIVERY|PICKUP),
  subtotal, tax, deliveryFee, tip, total, paymentStatus, paymentIntentId, notes,
  contact + delivery snapshot fields, createdAt`.
- **OrderItem** — `id, orderId, menuItemId, nameSnapshot, unitPrice, quantity, lineTotal, notes`.
- **OrderStatusEvent** — `id, orderId, status, message, createdAt` (drives the tracking timeline).
- **Review** — `id, userId, menuItemId, rating (1–5), title, body, isApproved, createdAt`
  (unique on `[userId, menuItemId]`).
- **CartItem** *(optional persistence)* — `id, userId, menuItemId, quantity, notes`.

### 4.2 Enums

- `Role`: `CUSTOMER`, `ADMIN`
- `OrderStatus`: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`,
  `COMPLETED`, `CANCELLED`
- `OrderType`: `DELIVERY`, `PICKUP`
- `PaymentStatus`: `UNPAID`, `PAID`, `REFUNDED`, `FAILED`
- `SpiceLevel`: `NONE`, `MILD`, `MEDIUM`, `HOT`

---

## 5. Feature Specification

### 5.1 Customer Features

| Feature | Description | Key routes |
|---|---|---|
| **Home page** | Hero, featured dishes, story/about, chef highlight, testimonials, hours/location, CTA. | `/` |
| **Menu page** | Full menu grid with category sections, dietary badges, prices, add-to-cart. | `/menu` |
| **Category filters** | Filter the menu by one/many categories; reflected in the URL (`?category=`). | `/menu?category=pasta` |
| **Search dishes** | Debounced search across name/description/ingredients; combinable with filters. | `/menu?q=truffle` |
| **Dish detail** | Large imagery, description, dietary info, reviews, add to cart with quantity/notes. | `/menu/[slug]` |
| **Shopping cart** | Slide-over drawer + full cart page; quantity edits, remove, subtotal, persistence. | `/cart` + drawer |
| **Checkout** | Address + contact, delivery/pickup, tip, order summary, place order. | `/checkout` |
| **User registration** | Email/password sign-up with validation. | `/register` |
| **Login** | Credentials sign-in; redirect back to intended page. | `/login` |
| **User profile** | Profile details, saved addresses, order history. | `/account`, `/account/addresses` |
| **Order tracking** | Status timeline for an order, auto-refreshing. | `/account/orders`, `/orders/[orderNumber]` |
| **Reviews** | Leave/edit a review on dishes the user ordered; star ratings aggregate to dish rating. | dish page + `/account/reviews` |

### 5.2 Admin Features

| Feature | Description | Key routes |
|---|---|---|
| **Admin login** | Same auth, gated by `ADMIN` role; non-admins are rejected. | `/login` → `/admin` |
| **Dashboard** | KPIs (revenue, orders, AOV, new users), recent orders, charts. | `/admin` |
| **Manage menu items** | CRUD dishes, image, pricing, availability, dietary flags, category assignment. | `/admin/menu` |
| **Manage categories** | CRUD categories, sort order, active toggle. | `/admin/categories` |
| **Manage orders** | List/filter orders, update status (drives tracking timeline), view details. | `/admin/orders` |
| **Manage users** | List/search users, view orders, change role, deactivate. | `/admin/users` |
| **Analytics** | Revenue over time, top dishes, orders by status, category mix. | `/admin/analytics` |

---

## 6. Route Map

### 6.1 Pages (App Router)

```
/                         Home                              (public)
/menu                     Menu + filters + search           (public)
/menu/[slug]              Dish detail + reviews             (public)
/cart                     Cart page                         (public)
/checkout                 Checkout                          (auth)
/login                    Sign in                           (public)
/register                 Sign up                           (public)
/account                  Profile overview                  (auth)
/account/orders           Order history                     (auth)
/account/addresses        Saved addresses                   (auth)
/account/reviews          My reviews                        (auth)
/orders/[orderNumber]     Order tracking (timeline)         (auth/owner)
/about                    Story / chef / values             (public)
/contact                  Contact + hours + map             (public)

/admin                    Dashboard                         (admin)
/admin/menu               Menu items CRUD                   (admin)
/admin/categories         Categories CRUD                   (admin)
/admin/orders             Orders management                 (admin)
/admin/orders/[id]        Order detail / status             (admin)
/admin/users              Users management                  (admin)
/admin/analytics          Analytics                         (admin)
```

### 6.2 API Route Handlers (`/app/api/**`)

```
POST   /api/auth/register            Create account
*      /api/auth/[...nextauth]       NextAuth handlers (login/session/logout)

GET    /api/menu                     List menu items (?category, ?q, ?featured, paging)
GET    /api/menu/[slug]              Single dish (+ reviews)
GET    /api/categories               List categories

GET    /api/cart                     Get persisted cart (auth)
POST   /api/cart                     Upsert cart item (auth)
PATCH  /api/cart/[itemId]            Update quantity/notes (auth)
DELETE /api/cart/[itemId]            Remove item (auth)

POST   /api/orders                   Place order (auth)
GET    /api/orders                   My orders (auth)
GET    /api/orders/[orderNumber]     Track order (auth/owner)

POST   /api/reviews                  Create/update review (auth, must have ordered)
GET    /api/reviews?menuItemId=      List approved reviews (public)

GET    /api/account                  Profile (auth)
PATCH  /api/account                  Update profile (auth)
GET/POST/PATCH/DELETE /api/account/addresses[/id]   Address CRUD (auth)

# Admin (all require ADMIN role)
GET/POST                 /api/admin/menu             List/create dish
PATCH/DELETE             /api/admin/menu/[id]        Update/delete dish
GET/POST                 /api/admin/categories       List/create
PATCH/DELETE             /api/admin/categories/[id]  Update/delete
GET                      /api/admin/orders           List/filter
PATCH                    /api/admin/orders/[id]      Update status
GET                      /api/admin/users            List/search
PATCH                    /api/admin/users/[id]       Role/active
GET                      /api/admin/analytics        Aggregated metrics
```

---

## 7. Authentication & Authorization

- **NextAuth (Auth.js) Credentials provider**; passwords hashed with `bcrypt`.
- **Session strategy:** JWT carrying `userId` and `role`.
- **Guards:**
  - `middleware.ts` protects `/admin/**` (require `ADMIN`) and `/account/**`, `/checkout`
    (require any authenticated user); unauthenticated users are redirected to `/login?callbackUrl=`.
  - API handlers re-check session + role server-side (never trust the client).
- **Authorization helpers:** `requireUser()`, `requireAdmin()` in `lib/auth/guards.ts`.
- **Ownership checks:** order tracking and reviews verify the resource belongs to the user.

---

## 8. Design System

### 8.1 Brand & Mood
Warm, editorial, "old-world trattoria meets modern fine dining." Generous whitespace, large food
photography, refined serif display headings paired with a clean sans body.

### 8.2 Color Tokens (CSS variables, light + dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | warm ivory `#FAF7F2` | espresso `#0E0B09` | page bg |
| `--foreground` | `#1C1714` | `#F4EEE7` | text |
| `--primary` (Bella red) | `#8E2A2A` | `#C0413B` | brand actions |
| `--secondary` (olive) | `#5B6236` | `#8A914E` | accents |
| `--accent` (gold) | `#C8A24A` | `#E0BE63` | highlights, prices |
| `--muted` | `#EFE8DE` | `#1B1612` | surfaces |
| `--card` | `#FFFFFF` | `#16110D` | cards |
| `--border` | `#E3D9CB` | `#2A2119` | dividers |
| `--destructive` | `#B3261E` | `#E0564E` | errors |

### 8.3 Typography
- **Display/Headings:** `Playfair Display` (serif).
- **Body/UI:** `Inter` (sans).
- Loaded via `next/font/google`; exposed as `--font-display` / `--font-sans`.
- Type scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72.

### 8.4 Layout & Spacing
- Container max-width `1280px`, fluid gutters.
- 4px spacing base; radius scale `sm 6 / md 10 / lg 16 / xl 24`.
- Soft shadows; subtle gold hairline borders on cards.

### 8.5 Dark Mode
- Tailwind `darkMode: 'class'`; theme toggled via `next-themes`, persisted, no-flash on load.
- All tokens have a dark counterpart; imagery uses overlays that adapt.

### 8.6 Accessibility
- WCAG 2.1 AA contrast, focus-visible rings, semantic landmarks, labeled controls,
  keyboard-navigable menus/drawers, `prefers-reduced-motion` respected.

### 8.7 Core UI Components
Button, Input, Textarea, Select, Badge, Card, Dialog/Drawer (Radix), DropdownMenu, Tabs, Toast,
Skeleton, Rating (stars), QuantityStepper, PriceTag, EmptyState, Pagination, DataTable (admin),
StatCard (admin), ThemeToggle, Navbar, Footer, CartDrawer.

---

## 9. Client State & Cart

- **Cart store (Zustand)** persisted to `localStorage`; holds `{ menuItemId, name, price, image,
  quantity, notes }[]` with selectors for counts/subtotal.
- For authenticated users the cart can sync to the DB (`CartItem`) on login/checkout.
- **Server state** (menu, orders, admin lists) via React Query for caching + background refresh;
  order-tracking page polls on an interval.

---

## 10. Non-Functional Requirements

- **Performance:** RSC + image optimization (`next/image`), code-splitting, ISR for menu,
  target Lighthouse ≥ 90 across the board.
- **SEO:** Per-route `metadata`, Open Graph, JSON-LD `Restaurant` + `Menu` structured data, sitemap.
- **Security:** Hashed passwords, server-side authz on every mutation, Zod validation, CSRF-safe
  auth flows, rate-limit seam on auth/order endpoints, no secrets in client bundles.
- **Reliability:** Transactional order creation, idempotent order number generation,
  graceful error/empty/loading states.
- **Observability:** Structured logging seam (`lib/logger.ts`); error boundaries per segment.
- **i18n-ready:** Money/format helpers centralized; copy isolated for future translation.

---

## 11. Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/bella_vista
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
# Optional integration seams
RESEND_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `.env.example` for the authoritative list.

---

## 12. Tooling, Scripts & Quality Gates

```
npm run dev          # next dev
npm run build        # next build
npm run start        # next start
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier --write
npm run test         # vitest
npm run e2e          # playwright
npm run db:migrate   # prisma migrate dev
npm run db:seed      # tsx prisma/seed.ts
npm run db:studio    # prisma studio
```

Husky pre-commit runs lint-staged (eslint + prettier); pre-push runs typecheck + unit tests.

---

## 13. Delivery Roadmap

| Phase | Scope | Output |
|---|---|---|
| **1. Spec & Structure** *(this phase)* | Specification, folder tree, configs, Prisma schema, skeletons. | This doc + scaffold |
| **2. Foundations** | Theme/tokens, layout (navbar/footer), UI kit, DB connect + seed. | Running shell |
| **3. Menu & Catalog** | Menu page, filters, search, dish detail, categories from DB. | Browsable menu |
| **4. Cart & Checkout** | Cart store/drawer, cart page, checkout, order creation. | Place orders |
| **5. Auth & Account** | Register/login, profile, addresses, order history + tracking. | Customer accounts |
| **6. Reviews** | Create/list reviews, rating aggregation, moderation flag. | Social proof |
| **7. Admin** | Dashboard, menu/category/order/user management, analytics. | Back-office |
| **8. Hardening** | A11y, SEO, tests, performance, polish. | Launch-ready |

---

## 14. Acceptance Criteria (v1 "done")

- Customer can browse, filter, search, add to cart, register, log in, check out, and see an order
  with a live-updating status timeline; can review a dish they ordered.
- Admin can sign in and perform full CRUD on menu items and categories, advance order statuses,
  manage users/roles, and view analytics with real seeded data.
- App is responsive from 320px up, ships a flicker-free dark mode, passes `lint` + `typecheck`,
  and the database is seedable to a realistic demo state in one command.
