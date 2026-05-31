import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ArrowLeft } from 'lucide-react';
import type { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Order Detail' };
export const dynamic = 'force-dynamic';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
const input = 'h-10 rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      statusEvents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order) notFound();

  async function changeStatus(formData: FormData) {
    'use server';
    await requireAdmin();
    const status = formData.get('status') as OrderStatus;
    const message = String(formData.get('message') ?? '').trim() || null;
    if (!STATUSES.includes(status)) return;
    await prisma.$transaction([
      prisma.order.update({ where: { id: params.id }, data: { status } }),
      prisma.orderStatusEvent.create({ data: { orderId: params.id, status, message } }),
    ]);
    revalidatePath(`/admin/orders/${params.id}`);
    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${order!.orderNumber}`);
    revalidatePath('/account/orders');
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
        <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Items */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">Items</h2>
            <ul className="divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 py-3 text-sm">
                  <span>
                    {it.quantity}× {it.nameSnapshot}
                  </span>
                  <span className="font-medium">{formatCurrency(Number(it.lineTotal))}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatCurrency(Number(order.subtotal))} />
              <Row label="Tax" value={formatCurrency(Number(order.tax))} />
              <Row label="Delivery" value={formatCurrency(Number(order.deliveryFee))} />
              <Row label="Tip" value={formatCurrency(Number(order.tip))} />
              <div className="flex justify-between pt-1 text-base font-bold">
                <dt>Total</dt>
                <dd className="text-accent">{formatCurrency(Number(order.total))}</dd>
              </div>
            </dl>
          </section>

          {/* History */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">Status history</h2>
            <ul className="space-y-3 text-sm">
              {order.statusEvents.map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span>
                    <span className="font-medium">{ORDER_STATUS_LABELS[e.status]}</span>
                    {e.message && <span className="text-muted-foreground"> — {e.message}</span>}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{formatDate(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Change status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Current: <span className="font-medium text-foreground">{ORDER_STATUS_LABELS[order.status]}</span>
            </p>
            <form action={changeStatus} className="mt-4 space-y-3">
              <select name="status" defaultValue={order.status} className={`${input} w-full`}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <input name="message" placeholder="Note (optional)" className={`${input} w-full`} />
              <button className="h-10 w-full rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
                Update status
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-sm">
            <h2 className="text-lg font-bold">Customer</h2>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p className="text-foreground">{order.contactName}</p>
              <p>{order.contactEmail}</p>
              <p>{order.contactPhone}</p>
              <p className="pt-2 capitalize">{order.type.toLowerCase()}</p>
              {order.type === 'DELIVERY' && order.addressLine1 && (
                <p>
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ''}, {order.city} {order.postalCode}
                </p>
              )}
              {order.notes && <p className="pt-2 italic">“{order.notes}”</p>}
            </div>
          </div>
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
