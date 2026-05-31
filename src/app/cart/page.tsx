'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { TAX_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import { useCartStore, selectCartSubtotal, selectCartCount } from '@/store/cart-store';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore(selectCartSubtotal);
  const count = useCartStore(selectCartCount);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax + deliveryFee).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Browse our menu and add a few dishes to get started.
        </p>
        <Button className="mt-8" asChild>
          <Link href="/menu">Explore the menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-4xl font-bold">Your Cart</h1>
        <button
          onClick={clear}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((line) => (
            <li key={line.menuItemId} className="flex gap-4 p-4">
              <Link
                href={`/menu/${line.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                {line.image && (
                  <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/menu/${line.slug}`} className="font-display text-lg font-semibold hover:text-primary">
                    {line.name}
                  </Link>
                  <span className="font-semibold text-accent">
                    {formatCurrency(line.price * line.quantity)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{formatCurrency(line.price)} each</p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(line.menuItemId)}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary */}
        <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Order Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal ({count} items)</dt>
              <dd className="font-medium">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="font-medium">{formatCurrency(tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium">
                {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
              </dd>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-muted-foreground">
                Add {formatCurrency(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold text-accent">{formatCurrency(total)}</dd>
            </div>
          </dl>

          <Button className="mt-6 w-full" size="lg" asChild>
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button className="mt-2 w-full" variant="ghost" asChild>
            <Link href="/menu">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
