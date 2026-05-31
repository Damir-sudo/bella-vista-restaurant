import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'My Addresses' };

/** Saved addresses (Phase 1 skeleton). Phase 5: address CRUD + default selection. */
export default async function AccountAddressesPage() {
  await requireUser('/account/addresses');
  return (
    <div>
      <h1 className="text-3xl font-bold">Saved Addresses</h1>
      <p className="mt-4 text-muted-foreground">Address management will be implemented here.</p>
    </div>
  );
}
