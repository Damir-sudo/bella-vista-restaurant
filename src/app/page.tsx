import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featured = await prisma.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    take: 6,
    orderBy: { createdAt: 'asc' },
    include: { category: { select: { name: true } } },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(14,11,9,0.55), rgba(14,11,9,0.8)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80')",
          }}
          aria-hidden
        />
        <div className="container flex min-h-[78vh] flex-col items-center justify-center py-24 text-center text-white">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent">
            Est. {new Date().getFullYear() - 12} · New York
          </p>
          <h1 className="max-w-3xl text-balance text-5xl font-bold leading-tight md:text-7xl">
            {SITE.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">{SITE.description}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/menu">
                Explore the Menu <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/40 text-white" asChild>
              <Link href="/contact">Reserve a Table</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured dishes */}
      <section className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Chef’s Selection</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Featured dishes</h2>
          <p className="mt-4 text-muted-foreground">
            A handpicked taste of Italy — our most-loved plates, crafted fresh each day.
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Featured dishes will appear here once the menu is seeded.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/menu/${item.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
              >
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
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {item.category.name}
                  </p>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">{item.name}</h3>
                    <span className="shrink-0 font-semibold text-accent">
                      {formatCurrency(Number(item.price))}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/menu">
              View full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
