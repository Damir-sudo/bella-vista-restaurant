import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

/** About (Phase 1 skeleton): story, chef, and values — built out in Phase 2. */
export default function AboutPage() {
  return (
    <div className="container py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-accent">Our Story</p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">From a small kitchen to your table</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        The brand story, chef highlight, and values sections will be implemented in the foundations
        phase.
      </p>
    </div>
  );
}
