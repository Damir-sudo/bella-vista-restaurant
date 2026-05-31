interface OrderTrackingPageProps {
  params: { orderNumber: string };
}

/**
 * Order tracking (Phase 1 skeleton). Owner-only.
 * Phase 5 adds: a status timeline (OrderStatusEvent) that auto-refreshes,
 * order summary, and delivery details.
 */
export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  return (
    <div className="container py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-accent">Order Tracking</p>
      <h1 className="mt-3 text-4xl font-bold">{params.orderNumber}</h1>
      <p className="mt-4 text-muted-foreground">
        The live status timeline will be implemented in the account &amp; tracking phase.
      </p>
    </div>
  );
}
