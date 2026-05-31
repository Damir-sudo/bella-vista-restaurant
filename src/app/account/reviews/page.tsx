import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'My Reviews' };

/** My reviews (Phase 1 skeleton). Phase 6: list/edit reviews on ordered dishes. */
export default async function AccountReviewsPage() {
  await requireUser('/account/reviews');
  return (
    <div>
      <h1 className="text-3xl font-bold">Your Reviews</h1>
      <p className="mt-4 text-muted-foreground">Your reviews will be listed here.</p>
    </div>
  );
}
