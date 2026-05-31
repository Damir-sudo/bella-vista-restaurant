import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Your Cart' };

/**
 * Cart page (Phase 1 skeleton).
 * Phase 4 adds: line items from the Zustand store, quantity steppers,
 * remove, order summary, and a checkout CTA.
 */
export default function CartPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold">Your Cart</h1>
      <p className="mt-4 text-muted-foreground">
        Cart line items and summary will be implemented in the cart &amp; checkout phase.
      </p>
    </div>
  );
}
