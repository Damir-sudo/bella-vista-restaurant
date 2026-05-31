import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, UtensilsCrossed, Leaf, Award } from 'lucide-react';
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
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80')",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/55 to-black/85"
          aria-hidden
        />
        <div className="container flex min-h-[86vh] flex-col items-center justify-center py-24 text-center text-white">
          <p className="eyebrow animate-fade-down text-accent">
            Est. {new Date().getFullYear() - 12} · New York
          </p>
          <div className="my-6 h-px w-20 animate-fade-in bg-accent/70" />
          <h1 className="max-w-4xl animate-fade-up text-balance font-display text-6xl font-bold leading-[1.05] md:text-8xl">
            {SITE.tagline}
          </h1>
          <p
            className="mt-7 max-w-xl animate-fade-up text-lg leading-relaxed text-white/80 [animation-delay:120ms]"
          >
            {SITE.description}
          </p>
          <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4 [animation-delay:240ms]">
            <Button size="lg" className="btn-sheen" asChild>
              <Link href="/menu">
                Explore the Menu <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/5 text-white backdrop-blur hover:bg-white/15"
              asChild
            >
              <Link href="/contact">Reserve a Table</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-white/60" aria-hidden>
          <div className="h-10 w-6 rounded-full border border-white/40 p-1">
            <div className="mx-auto h-2 w-1 rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="border-b border-border bg-card">
        <div className="container grid gap-8 py-12 sm:grid-cols-3">
          {[
            { icon: UtensilsCrossed, title: 'Hand-made daily', text: 'Fresh pasta & dough crafted each morning.' },
            { icon: Leaf, title: 'Finest ingredients', text: 'Imported DOP produce and local seasonal picks.' },
            { icon: Award, title: 'Award-winning', text: 'Recognised for authentic regional cuisine.' },
          ].map((v) => (
            <div key={v.title} className="flex items-start gap-4">
              <v.icon className="h-7 w-7 shrink-0 text-accent" />
              <div>
                <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured dishes */}
      <section className="container py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow">Chef’s Selection</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Featured dishes</h2>
          <div className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-accent to-transparent" />
          <p className="mt-5 text-muted-foreground">
            A handpicked taste of Italy — our most-loved plates, crafted fresh each day.
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Featured dishes will appear here once the menu is seeded.
          </p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <Link
                key={item.id}
                href={`/menu/${item.slug}`}
                className="card-premium group animate-fade-up overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 text-sm font-semibold text-accent shadow-soft backdrop-blur">
                    {formatCurrency(Number(item.price))}
                  </span>
                </div>
                <div className="p-6">
                  <p className="eyebrow text-[0.65rem]">{item.category.name}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold transition-colors group-hover:text-accent">
                    {item.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/menu">
              View full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Story band */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container grid items-center gap-12 py-24 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lift">
            <Image
              src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80"
              alt="The Bella Vista kitchen"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-accent">Our Story</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
              A family recipe, perfected over generations
            </h2>
            <p className="mt-5 leading-relaxed text-primary-foreground/80">
              From a small trattoria to a beloved New York destination, Bella Vista brings the warmth
              of the Italian table to every plate. We honour tradition while celebrating the
              ingredients of each season.
            </p>
            <Button variant="accent" size="lg" className="mt-8" asChild>
              <Link href="/about">Discover our journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="container py-24 text-center">
        <p className="eyebrow">Join us</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold md:text-5xl">
          An evening to remember awaits
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Reserve your table or order in — either way, the taste of Italy is moments away.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="btn-sheen" asChild>
            <Link href="/menu">Order Online</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Book a Table</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
