import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'My Orders' };

/** Order history (Phase 1 skeleton). Phase 5: list with status + tracking links. */
export default async function AccountOrdersPage() {
  await requireUser('/account/orders');
  return (
    <div>
      <h1 className="text-3xl font-bold">Your Orders</h1>
      <p className="mt-4 text-muted-foreground">Order history will be implemented here.</p>
    </div>
  );
}
