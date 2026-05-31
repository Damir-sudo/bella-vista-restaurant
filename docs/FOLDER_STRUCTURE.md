# Bella Vista — Folder Structure

This is the target directory tree for the platform. Items marked `(scaffolded)` are created in
Phase 1; the rest are filled in during later phases per the roadmap in `SPECIFICATION.md`.

```
bella-vista-restaurant/
├─ docs/
│  ├─ SPECIFICATION.md            # Full product + technical spec            (scaffolded)
│  └─ FOLDER_STRUCTURE.md         # This file                                (scaffolded)
│
├─ prisma/
│  ├─ schema.prisma               # Models, enums, relations                 (scaffolded)
│  └─ seed.ts                     # Demo data: admin, categories, dishes...   (scaffolded)
│
├─ public/
│  ├─ images/                     # Static brand/food imagery
│  └─ favicon / og assets
│
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               # Root layout: fonts, theme, providers      (scaffolded)
│  │  ├─ globals.css              # Tailwind layers + design tokens           (scaffolded)
│  │  ├─ page.tsx                 # Home                                      (scaffolded)
│  │  ├─ loading.tsx / error.tsx / not-found.tsx
│  │  │
│  │  ├─ (marketing)/             # Public marketing pages group
│  │  │  ├─ about/page.tsx
│  │  │  └─ contact/page.tsx
│  │  │
│  │  ├─ menu/
│  │  │  ├─ page.tsx              # Menu + filters + search                   (scaffolded)
│  │  │  └─ [slug]/page.tsx       # Dish detail + reviews                     (scaffolded)
│  │  │
│  │  ├─ cart/page.tsx            # Cart page                                 (scaffolded)
│  │  ├─ checkout/page.tsx        # Checkout                                  (scaffolded)
│  │  │
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx                                                    (scaffolded)
│  │  │  └─ register/page.tsx                                                 (scaffolded)
│  │  │
│  │  ├─ account/
│  │  │  ├─ layout.tsx            # Account shell + nav
│  │  │  ├─ page.tsx              # Profile
│  │  │  ├─ orders/page.tsx       # Order history
│  │  │  ├─ addresses/page.tsx    # Saved addresses
│  │  │  └─ reviews/page.tsx      # My reviews
│  │  │
│  │  ├─ orders/[orderNumber]/page.tsx   # Order tracking timeline
│  │  │
│  │  ├─ admin/
│  │  │  ├─ layout.tsx            # Admin shell (sidebar) + role guard        (scaffolded)
│  │  │  ├─ page.tsx              # Dashboard                                 (scaffolded)
│  │  │  ├─ menu/page.tsx
│  │  │  ├─ categories/page.tsx
│  │  │  ├─ orders/page.tsx
│  │  │  ├─ orders/[id]/page.tsx
│  │  │  ├─ users/page.tsx
│  │  │  └─ analytics/page.tsx
│  │  │
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/route.ts                                       (scaffolded)
│  │     ├─ auth/register/route.ts
│  │     ├─ menu/route.ts
│  │     ├─ menu/[slug]/route.ts
│  │     ├─ categories/route.ts
│  │     ├─ cart/route.ts  ·  cart/[itemId]/route.ts
│  │     ├─ orders/route.ts  ·  orders/[orderNumber]/route.ts
│  │     ├─ reviews/route.ts
│  │     ├─ account/route.ts  ·  account/addresses/[id]/route.ts
│  │     └─ admin/{menu,categories,orders,users,analytics}/...
│  │
│  ├─ components/
│  │  ├─ ui/                      # Design-system primitives (Button, Input…) (scaffolded: Button)
│  │  ├─ layout/                  # Navbar, Footer, Container, ThemeToggle    (scaffolded: Navbar/Footer)
│  │  ├─ menu/                    # DishCard, MenuFilters, SearchBar
│  │  ├─ cart/                    # CartDrawer, CartLineItem, CartSummary
│  │  ├─ checkout/                # CheckoutForm, OrderSummary
│  │  ├─ account/                 # OrderTimeline, AddressForm, ReviewForm
│  │  ├─ reviews/                 # ReviewList, RatingStars
│  │  ├─ home/                    # Hero, Featured, Story, Testimonials
│  │  ├─ admin/                   # Sidebar, DataTable, StatCard, charts
│  │  └─ providers/               # ThemeProvider, QueryProvider, Toaster     (scaffolded)
│  │
│  ├─ lib/
│  │  ├─ prisma.ts                # Prisma client singleton                   (scaffolded)
│  │  ├─ auth/
│  │  │  ├─ options.ts            # NextAuth config (Credentials, callbacks)  (scaffolded)
│  │  │  └─ guards.ts             # requireUser / requireAdmin                (scaffolded)
│  │  ├─ services/                # menu, orders, reviews, users, analytics
│  │  ├─ validations/             # Zod schemas (auth, order, review, menu)   (scaffolded: auth)
│  │  ├─ utils.ts                 # cn(), formatCurrency, slugify, etc.       (scaffolded)
│  │  ├─ constants.ts             # nav, statuses, tax/fees config            (scaffolded)
│  │  └─ logger.ts                # logging seam
│  │
│  ├─ store/
│  │  └─ cart-store.ts            # Zustand cart (persisted)                  (scaffolded)
│  │
│  ├─ types/
│  │  ├─ index.ts                 # Shared app types                         (scaffolded)
│  │  └─ next-auth.d.ts           # Session/role augmentation                 (scaffolded)
│  │
│  └─ middleware.ts               # Route protection (admin/account)         (scaffolded)
│
├─ .env.example                                                              (scaffolded)
├─ .eslintrc.json                                                            (scaffolded)
├─ .prettierrc                                                               (scaffolded)
├─ next.config.mjs                                                           (scaffolded)
├─ postcss.config.mjs                                                        (scaffolded)
├─ tailwind.config.ts                                                        (scaffolded)
├─ tsconfig.json                                                             (scaffolded)
├─ package.json                                                              (scaffolded)
├─ .gitignore
├─ LICENSE
└─ README.md
```

## Conventions

- **`src/` root** keeps app code separate from config; path alias `@/*-> src/*`.
- **Route groups** `(marketing)`, `(auth)` organize pages without affecting the URL.
- **Server-only data access** lives in `lib/services/*`; pages/handlers call services, services call Prisma.
- **Shared Zod schemas** in `lib/validations/*` are imported by both forms and API handlers.
- **UI primitives** in `components/ui/*` are brand-skinned and reused everywhere (incl. admin).
