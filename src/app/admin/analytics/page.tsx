import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics' };

/** Admin analytics (Phase 1 skeleton). Phase 7: revenue/orders charts, top dishes. */
export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-4 text-muted-foreground">Charts and metrics will be implemented here.</p>
    </div>
  );
}
