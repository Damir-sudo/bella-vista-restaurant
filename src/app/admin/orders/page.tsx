import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Orders' };

/** Admin orders list (Phase 1 skeleton). Phase 7: filterable table + status update. */
export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="mt-4 text-muted-foreground">Order management will be implemented here.</p>
    </div>
  );
}
