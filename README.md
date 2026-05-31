# Bella Vista 🍝

Premium Italian restaurant platform with online ordering, customer accounts, reviews, order
tracking, and a full admin back-office.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma · NextAuth**.

> 📄 See [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) for the full product & technical spec, and
> [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) for the directory map.

## Features

**Customers:** home, menu with category filters & search, dish detail, cart, checkout, registration,
login, profile, saved addresses, order tracking, and reviews.

**Admins:** dashboard, manage menu items, categories, orders, and users, plus analytics.

**Design:** luxury Italian aesthetic, fully responsive, polished dark mode (`next-themes`).

## Getting started

> Requires Node.js ≥ 18.18 and a PostgreSQL database.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   → set DATABASE_URL and generate NEXTAUTH_SECRET (openssl rand -base64 32)

# 3. Create the database schema and seed demo data
npm run db:migrate      # creates tables (prisma migrate dev)
npm run db:seed         # admin + customer + categories + dishes + sample order

# 4. Run the dev server
npm run dev             # http://localhost:3000
```

### Seeded accounts

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Admin    | `admin@bellavista.test`| `ChangeMe123!` |
| Customer | `guest@bellavista.test`| `Password123!` |

(Override the admin via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`.)

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run lint` / `npm run typecheck` | Quality gates |
| `npm run db:migrate` / `db:seed` / `db:studio` | Database workflows |
| `npm run test` / `npm run e2e` | Unit & end-to-end tests |

## Project status

Phase 1 (specification + scaffold) is complete: configs, Prisma schema + seed, design tokens,
layout, auth foundation, cart store, and skeleton pages/routes for every feature. Subsequent phases
fill in the data-driven UI per the roadmap in the specification.
