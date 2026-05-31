import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'My Account' };

/**
 * Account overview (Phase 1 skeleton). Protected by middleware + guard.
 * Phase 5 adds: profile editing, saved addresses, and order history links.
 */
export default async function AccountPage() {
  const user = await requireUser('/account');

  return (
    <div>
      <h1 className="text-3xl font-bold">Hello, {user.name}</h1>
      <p className="mt-4 text-muted-foreground">
        Profile, addresses, orders, and reviews will be implemented in the account phase.
      </p>
    </div>
  );
}
