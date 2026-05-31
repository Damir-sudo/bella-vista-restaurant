import type { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [revenueAgg, orderCount, pendingCount, customerCount, recentOrders, topGroups] =
    await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.orderItem.groupBy({
        by: ['nameSnapshot'],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

  const revenue = Number(revenueAgg._sum.total ?? 0);
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

  const stats = [
    { label: 'Revenue', value: formatCurrency(revenue), icon: DollarSign },
    { label: 'Orders', value: String(orderCount), sub: `${pendingCount} active`, icon: ShoppingBag },
    { label: 'Customers', value: String(customerCount), icon: Users },
    { label: 'Avg. order value', value: formatCurrency(avgOrder), icon: TrendingUp },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-3 text-3xl font-bold">{s.value}</p>
              {s.sub && <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.user.name} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                      <span className="font-semibold text-accent">
                        {formatCurrency(Number(o.total))}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top selling dishes */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-xl font-bold">Top selling dishes</h2>
          {topGroups.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ol className="space-y-3">
              {topGroups.map((g, i) => (
                <li key={g.nameSnapshot} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {i + 1}
                    </span>
                    {g.nameSnapshot}
                  </span>
                  <span className="text-right">
                    <span className="font-semibold">{g._sum.quantity ?? 0} sold</span>
                    <span className="ml-3 text-muted-foreground">
                      {formatCurrency(Number(g._sum.lineTotal ?? 0))}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
