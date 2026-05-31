import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, UtensilsCrossed, Leaf, Award, Star, Quote } from 'lucide-react';
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

      {/* Chef section */}
      <section className="container py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl shadow-lift">
            <Image
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80"
              alt="Executive Chef Marco Rossi"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="font-display text-2xl font-semibold text-white">Marco Rossi</p>
              <p className="text-sm text-white/75">Executive Chef</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Meet the Chef</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
              Where heritage meets the modern table
            </h2>
            <div className="my-6 hairline" />
            <p className="leading-relaxed text-muted-foreground">
              Born in Bologna and trained across the kitchens of Tuscany and Rome, Chef Marco brings
              three decades of craft to Bella Vista. His philosophy is simple — respect the
              ingredient, honour the tradition, and serve every guest like family.
            </p>
            <p className="mt-4 font-display text-2xl italic text-accent">
              “Cucina è amore — cooking is love made visible.”
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container pb-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">The Experience</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">A feast for every sense</h2>
          <div className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
          {[
            { src: 'photo-1517248135467-4c7edcad34c4', span: 'col-span-2 row-span-2' },
            { src: 'photo-1559339352-11d035aa65de', span: '' },
            { src: 'photo-1466978913421-dad2ebd01d17', span: '' },
            { src: 'photo-1555396273-367ea4eb4db5', span: '' },
            { src: 'photo-1424847651672-bf20a4b0982b', span: '' },
          ].map((g, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl ${g.span} ${i === 0 ? 'aspect-square md:aspect-auto' : 'aspect-square'}`}
            >
              <Image
                src={`https://images.unsplash.com/${g.src}?auto=format&fit=crop&w=900&q=80`}
                alt="Bella Vista ambience"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/20" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 py-24">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="eyebrow">Guest Love</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">What our guests say</h2>
            <div className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {[
              {
                quote:
                  'The finest Italian dining in the city. Every dish felt like a love letter to Italy.',
                name: 'Elena M.',
                role: 'Food Critic',
              },
              {
                quote:
                  'From the truffle tagliatelle to the tiramisù — flawless. The ambience is pure magic.',
                name: 'James P.',
                role: 'Regular Guest',
              },
              {
                quote:
                  'Impeccable service and authentic flavours. Bella Vista is now our anniversary tradition.',
                name: 'Sofia & Luca',
                role: 'Guests since 2019',
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="card-premium flex flex-col p-8"
              >
                <Quote className="h-8 w-8 text-accent/50" />
                <div className="mt-4 flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-border/60 pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </figcaption>
              </figure>
            ))}
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
