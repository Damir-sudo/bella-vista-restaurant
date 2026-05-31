import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'My Orders' };
export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const user = await requireUser('/account/orders');

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">You haven’t placed any orders yet.</p>
          <Link href="/menu" className="mt-4 inline-block font-medium text-primary hover:underline">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-soft"
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} · {order._count.items} item
                    {order._count.items === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-semibold text-accent">
                    {formatCurrency(Number(order.total))}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
