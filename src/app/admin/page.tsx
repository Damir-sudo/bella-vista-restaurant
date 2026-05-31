import type { Metadata } from 'next';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ChevronRight,
  Star,
  Check,
  EyeOff,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import type { ReservationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

const RES_STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'];

async function recomputeRating(menuItemId: string) {
  const agg = await prisma.review.aggregate({
    where: { menuItemId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.menuItem.update({
    where: { id: menuItemId },
    data: { ratingAverage: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count },
  });
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [revenueAgg, orderCount, pendingCount, customerCount, recentOrders, topGroups, reviews, reservations] =
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
      prisma.review.findMany({
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          menuItem: { select: { name: true, slug: true } },
        },
      }),
      prisma.reservation.findMany({
        take: 12,
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ]);

  async function toggleApprove(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const r = await prisma.review.findUnique({ where: { id } });
    if (!r) return;
    await prisma.review.update({ where: { id }, data: { isApproved: !r.isApproved } });
    await recomputeRating(r.menuItemId);
    revalidatePath('/admin');
    revalidatePath(`/menu/${formData.get('slug')}`);
  }

  async function deleteReview(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const r = await prisma.review.findUnique({ where: { id } });
    if (!r) return;
    await prisma.review.delete({ where: { id } });
    await recomputeRating(r.menuItemId);
    revalidatePath('/admin');
    revalidatePath(`/menu/${formData.get('slug')}`);
  }

  async function setReservationStatus(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const status = formData.get('status') as ReservationStatus;
    if (!id || !RES_STATUSES.includes(status)) return;
    await prisma.reservation.update({ where: { id }, data: { status } });
    revalidatePath('/admin');
    revalidatePath('/contact');
  }

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

      {/* Reservation management */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <CalendarDays className="h-5 w-5 text-accent" /> Reservations
        </h2>
        {reservations.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No reservations yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reservations.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="text-sm">
                  <p className="font-medium">
                    {formatDate(r.date)} ·{' '}
                    {r.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ·{' '}
                    party of {r.partySize}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.name} · {r.phone}
                    {r.notes ? ` · ${r.notes}` : ''}
                  </p>
                </div>
                <form action={setReservationStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                  >
                    {RES_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <button className="h-9 rounded-md border border-border px-3 text-xs hover:bg-muted">
                    Update
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Review moderation */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-xl font-bold">Review moderation</h2>
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-accent' : 'opacity-30'}`} />
                      ))}
                    </span>
                    <Link href={`/menu/${r.menuItem.slug}`} className="text-sm font-medium hover:text-primary">
                      {r.menuItem.name}
                    </Link>
                    {!r.isApproved && (
                      <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
                        Hidden
                      </span>
                    )}
                  </div>
                  {r.title && <p className="mt-1 text-sm font-medium">{r.title}</p>}
                  {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.user.name} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={toggleApprove}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="slug" value={r.menuItem.slug} />
                    <button
                      title={r.isApproved ? 'Hide review' : 'Approve review'}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      {r.isApproved ? <EyeOff className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      {r.isApproved ? 'Hide' : 'Approve'}
                    </button>
                  </form>
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="slug" value={r.menuItem.slug} />
                    <button
                      title="Delete review"
                      aria-label="Delete review"
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
