import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { generateOrderNumber } from '@/lib/utils';
import { TAX_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import { CheckoutCartFields } from '@/components/layout/navbar';

export const metadata: Metadata = { title: 'Checkout' };

const inputClass =
  'h-11 w-full rounded-md border border-input bg-card px-4 text-sm outline-none ring-ring focus-visible:ring-2';

interface IncomingLine {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireUser('/checkout');

  async function createOrder(formData: FormData) {
    'use server';
    const sessionUser = await requireUser('/checkout');

    const raw = formData.get('cart');
    let incoming: IncomingLine[] = [];
    try {
      incoming = JSON.parse(typeof raw === 'string' ? raw : '[]');
    } catch {
      incoming = [];
    }
    const valid = incoming.filter((i) => i?.menuItemId && i.quantity > 0);
    if (valid.length === 0) redirect('/menu');

    const dbItems = await prisma.menuItem.findMany({
      where: { id: { in: valid.map((i) => i.menuItemId) } },
    });

    const lines = valid
      .map((v) => {
        const m = dbItems.find((d) => d.id === v.menuItemId);
        if (!m) return null;
        const unitPrice = Number(m.price);
        const quantity = Math.min(Math.max(1, Math.floor(v.quantity)), 99);
        return {
          menuItemId: m.id,
          nameSnapshot: m.name,
          unitPrice,
          quantity,
          lineTotal: +(unitPrice * quantity).toFixed(2),
          notes: v.notes ?? null,
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    if (lines.length === 0) redirect('/menu');

    const subtotal = +lines.reduce((s, l) => s + l.lineTotal, 0).toFixed(2);
    const type = formData.get('type') === 'PICKUP' ? 'PICKUP' : 'DELIVERY';
    const deliveryFee = type === 'PICKUP' || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const tip = Math.max(0, Number(formData.get('tip')) || 0);
    const total = +(subtotal + tax + deliveryFee + tip).toFixed(2);
    const str = (k: string) => ((formData.get(k) as string | null)?.trim() || null);

    // Delivery orders must have a deliverable address (form fields are optional
    // because pickup ignores them, so this is enforced server-side).
    if (type === 'DELIVERY' && (!str('addressLine1') || !str('city'))) {
      redirect('/checkout?error=address');
    }

    const data = {
      userId: sessionUser.id,
      status: 'CONFIRMED' as const,
      type,
      paymentStatus: 'PAID' as const,
      subtotal,
      tax,
      deliveryFee,
      tip,
      total,
      contactName: str('contactName') ?? sessionUser.name ?? 'Guest',
      contactEmail: str('contactEmail') ?? sessionUser.email ?? '',
      contactPhone: str('contactPhone') ?? '',
      addressLine1: type === 'DELIVERY' ? str('addressLine1') : null,
      addressLine2: type === 'DELIVERY' ? str('addressLine2') : null,
      city: type === 'DELIVERY' ? str('city') : null,
      postalCode: type === 'DELIVERY' ? str('postalCode') : null,
      country: type === 'DELIVERY' ? str('country') : null,
      notes: str('notes'),
      items: { create: lines },
      statusEvents: {
        create: [
          { status: 'PENDING' as const, message: 'Order received.' },
          { status: 'CONFIRMED' as const, message: 'Payment confirmed.' },
        ],
      },
    };

    // Order numbers are generated client-of-DB and are @unique. On the rare
    // chance of a collision, retry with a fresh number instead of 500-ing a
    // customer whose payment was already confirmed.
    let orderNumber = generateOrderNumber();
    for (let attempt = 0; ; attempt++) {
      try {
        await prisma.order.create({ data: { ...data, orderNumber } });
        break;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          attempt < 5
        ) {
          orderNumber = generateOrderNumber();
          continue;
        }
        throw err;
      }
    }

    redirect(`/orders/${orderNumber}?new=1`);
  }

  return (
    <div className="container py-16">
      <h1 className="mb-8 text-4xl font-bold">Checkout</h1>
      {searchParams.error === 'address' && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Please provide a delivery address (street and city), or switch to pickup.
        </div>
      )}
      <form action={createOrder} className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Order type */}
          <fieldset className="rounded-xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Order type</legend>
            <div className="mt-2 flex gap-6 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="type" value="DELIVERY" defaultChecked /> Delivery
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="type" value="PICKUP" /> Pickup
              </label>
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="rounded-xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Contact</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <input
                name="contactName"
                placeholder="Full name"
                required
                defaultValue={user.name ?? ''}
                className={inputClass}
              />
              <input
                name="contactEmail"
                type="email"
                placeholder="Email"
                required
                defaultValue={user.email ?? ''}
                className={inputClass}
              />
              <input
                name="contactPhone"
                placeholder="Phone"
                required
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
          </fieldset>

          {/* Delivery address */}
          <fieldset className="rounded-xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Delivery address</legend>
            <p className="mt-1 text-xs text-muted-foreground">
              Required for delivery orders; ignored for pickup.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <input
                name="addressLine1"
                placeholder="Address line 1"
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                name="addressLine2"
                placeholder="Address line 2 (optional)"
                className={`${inputClass} sm:col-span-2`}
              />
              <input name="city" placeholder="City" className={inputClass} />
              <input name="postalCode" placeholder="Postal code" className={inputClass} />
              <input
                name="country"
                placeholder="Country"
                defaultValue="United States"
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
          </fieldset>

          {/* Extras */}
          <fieldset className="rounded-xl border border-border bg-card p-6">
            <legend className="px-1 text-sm font-semibold">Extras</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-muted-foreground">Tip ($)</span>
                <input
                  name="tip"
                  type="number"
                  min="0"
                  step="0.5"
                  defaultValue="0"
                  className={inputClass}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-muted-foreground">Order notes (optional)</span>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Allergies, delivery instructions…"
                  className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <CheckoutCartFields />
      </form>
    </div>
  );
}
