import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Checkout' };

/**
 * Checkout (Phase 1 skeleton). Protected by middleware (auth required).
 * Phase 4 adds: contact + delivery form, delivery/pickup toggle, tip,
 * order summary, and order placement via /api/orders.
 */
export default function CheckoutPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold">Checkout</h1>
      <p className="mt-4 text-muted-foreground">
        The checkout form and order placement will be implemented in the cart &amp; checkout phase.
      </p>
    </div>
  );
}
