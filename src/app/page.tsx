import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/constants';

/**
 * Home page (Phase 1 skeleton).
 * Phase 2/3 will replace the placeholder sections with data-driven
 * featured dishes, story, testimonials, and hours from the database.
 */
export default function HomePage() {
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

      {/* Placeholder sections — built out in later phases */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">A taste of Italy, perfected</h2>
          <p className="mt-4 text-muted-foreground">
            Featured dishes, our story, and guest reviews will appear here once the catalog and
            reviews modules are connected to the database.
          </p>
        </div>
      </section>
    </>
  );
}
