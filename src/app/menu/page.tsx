import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse the full Bella Vista menu — antipasti, pasta, pizza, secondi and dolci.',
};

/**
 * Menu page (Phase 1 skeleton).
 * Phase 3 adds: category filter bar, debounced search, and a grid of DishCards
 * fetched from /api/menu (server-rendered with searchParams for ?category & ?q).
 */
export default function MenuPage() {
  return (
    <div className="container py-16">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Our Menu</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Crafted daily, served with passion</h1>
      </header>
      <p className="text-center text-muted-foreground">
        Category filters, search, and the dish grid will be implemented in the catalog phase.
      </p>
    </div>
  );
}
