import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

/**
 * Admin dashboard (Phase 1 skeleton).
 * Phase 7 adds: KPI StatCards (revenue, orders, AOV, new users),
 * recent orders table, and charts (Recharts) from /api/admin/analytics.
 */
export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        KPIs, recent orders, and charts will be implemented in the admin phase.
      </p>
    </div>
  );
}
