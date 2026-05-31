import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { formatCurrency, cn } from '@/lib/utils';
import { AddToCartButton } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse the full Bella Vista menu — antipasti, pasta, pizza, secondi and dolci.',
};

export const dynamic = 'force-dynamic';

interface MenuPageProps {
  searchParams: { category?: string; q?: string };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const activeCategory = searchParams.category?.trim() || '';
  const query = searchParams.q?.trim() || '';

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  const where: Prisma.MenuItemWhereInput = { isAvailable: true };
  if (activeCategory) where.category = { slug: activeCategory };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { ingredients: { contains: query, mode: 'insensitive' } },
    ];
  }

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    include: { category: { select: { name: true } } },
  });

  const buildHref = (categorySlug: string) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (query) params.set('q', query);
    const qs = params.toString();
    return qs ? `/menu?${qs}` : '/menu';
  };

  return (
    <div className="container py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Our Menu</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Crafted daily, served with passion</h1>
      </header>

      {/* Search */}
      <form action="/menu" method="GET" className="mx-auto mb-8 flex max-w-xl gap-2">
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search dishes, ingredients…"
          aria-label="Search dishes"
          className="h-11 flex-1 rounded-md border border-input bg-card px-4 text-sm outline-none ring-ring focus-visible:ring-2"
        />
        <button
          type="submit"
          className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {/* Category filters */}
      <nav className="mb-12 flex flex-wrap justify-center gap-2">
        <FilterPill href={buildHref('')} active={!activeCategory}>
          All
        </FilterPill>
        {categories.map((c) => (
          <FilterPill key={c.id} href={buildHref(c.slug)} active={activeCategory === c.slug}>
            {c.name}
          </FilterPill>
        ))}
      </nav>

      {/* Grid */}
      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No dishes match your search. Try a different term or category.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
            >
              <Link href={`/menu/${item.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {item.isFeatured && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      Chef’s pick
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.category.name}
                </p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <Link href={`/menu/${item.slug}`}>
                    <h3 className="font-display text-xl font-semibold hover:text-primary">
                      {item.name}
                    </h3>
                  </Link>
                  <span className="shrink-0 font-semibold text-accent">
                    {formatCurrency(Number(item.price))}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.isVegetarian && <Tag>Vegetarian</Tag>}
                  {item.isVegan && <Tag>Vegan</Tag>}
                  {item.isGlutenFree && <Tag>Gluten-free</Tag>}
                </div>
                <div className="mt-4 flex items-center justify-end pt-2">
                  <AddToCartButton
                    item={{
                      menuItemId: item.id,
                      name: item.name,
                      slug: item.slug,
                      price: Number(item.price),
                      image: item.image,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary',
      )}
    >
      {children}
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
