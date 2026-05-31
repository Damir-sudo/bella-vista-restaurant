import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Prisma, type OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Manage Orders' };
export const dynamic = 'force-dynamic';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  await requireAdmin();
  const q = searchParams.q?.trim() || '';
  const status = STATUSES.includes(searchParams.status as OrderStatus)
    ? (searchParams.status as OrderStatus)
    : '';

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { contactName: { contains: q, mode: 'insensitive' } },
      { contactEmail: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [orders, revenueAgg, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, _count: { select: { items: true } } },
    }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.count(),
  ]);

  const filteredRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((s, o) => s + Number(o.total), 0);

  const pill = (label: string, value: string, active: boolean) => (
    <Link
      href={`/admin/orders?${new URLSearchParams({ ...(q ? { q } : {}), ...(value ? { status: value } : {}) }).toString()}`}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary',
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Orders</h1>

      {/* Revenue summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Total revenue" value={formatCurrency(Number(revenueAgg._sum.total ?? 0))} />
        <Card label="All orders" value={String(totalCount)} />
        <Card label="Showing (revenue)" value={`${orders.length} · ${formatCurrency(filteredRevenue)}`} />
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {pill('All', '', !status)}
          {STATUSES.map((s) => pill(ORDER_STATUS_LABELS[s], s, status === s))}
        </div>
        <form method="GET" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search # / name / email…"
            className="h-10 w-56 rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
          <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="p-4 font-medium">{o.orderNumber}</td>
                  <td className="p-4">{o.user.name}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-accent">
                    {formatCurrency(Number(o.total))}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      View <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
