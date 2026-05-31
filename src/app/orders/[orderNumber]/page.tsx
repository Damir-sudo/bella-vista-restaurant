import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, PartyPopper, XCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/lib/constants';
import { ClearCartOnMount } from '@/components/layout/navbar';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { orderNumber: string };
  searchParams: { new?: string };
}

export const metadata: Metadata = { title: 'Order Tracking' };

export default async function OrderTrackingPage({ params, searchParams }: PageProps) {
  const user = await requireUser(`/orders/${params.orderNumber}`);

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true, statusEvents: { orderBy: { createdAt: 'asc' } } },
  });

  if (!order || (order.userId !== user.id && user.role !== 'ADMIN')) notFound();

  const isNew = searchParams.new === '1';
  const cancelled = order.status === 'CANCELLED';
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);

  return (
    <div className="container py-12">
      {isNew && <ClearCartOnMount />}

      {isNew && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4">
          <PartyPopper className="h-6 w-6 text-accent" />
          <div>
            <p className="font-semibold">Thank you! Your order is confirmed.</p>
            <p className="text-sm text-muted-foreground">
              A confirmation has been sent to {order.contactEmail}.
            </p>
          </div>
        </div>
      )}

      <p className="text-sm uppercase tracking-[0.3em] text-accent">Order Tracking</p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-4xl font-bold">{order.orderNumber}</h1>
        <span className="text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Timeline */}
        <section>
          <h2 className="mb-6 text-xl font-bold">Status</h2>
          {cancelled ? (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
              <XCircle className="h-5 w-5" /> This order was cancelled.
            </div>
          ) : (
            <ol className="space-y-4">
              {ORDER_STATUS_FLOW.map((status, i) => {
                const done = i <= currentIndex;
                return (
                  <li key={status} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/40" />
                    )}
                    <span
                      className={done ? 'font-medium' : 'text-muted-foreground'}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Items */}
          <h2 className="mb-4 mt-10 text-xl font-bold">Items</h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3 p-4 text-sm">
                <span>
                  {it.quantity}× {it.nameSnapshot}
                </span>
                <span className="font-medium">{formatCurrency(Number(it.lineTotal))}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Summary + delivery */}
        <aside className="h-fit space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatCurrency(Number(order.subtotal))} />
              <Row label="Tax" value={formatCurrency(Number(order.tax))} />
              <Row
                label="Delivery"
                value={
                  Number(order.deliveryFee) === 0 ? 'Free' : formatCurrency(Number(order.deliveryFee))
                }
              />
              <Row label="Tip" value={formatCurrency(Number(order.tip))} />
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold text-accent">{formatCurrency(Number(order.total))}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">
              {order.type === 'PICKUP' ? 'Pickup' : 'Delivery'} details
            </h2>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p className="text-foreground">{order.contactName}</p>
              <p>{order.contactEmail}</p>
              <p>{order.contactPhone}</p>
              {order.type === 'DELIVERY' && order.addressLine1 && (
                <p className="pt-2">
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ''}, {order.city}{' '}
                  {order.postalCode}
                </p>
              )}
              {order.notes && <p className="pt-2 italic">“{order.notes}”</p>}
            </div>
          </div>

          <Link
            href="/account/orders"
            className="block text-center text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            View all orders
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
