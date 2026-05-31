'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag, User } from 'lucide-react';
import {
  MAIN_NAV,
  SITE,
  TAX_RATE,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
} from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useCartStore, selectCartCount, selectCartSubtotal } from '@/store/cart-store';
import { signOut } from 'next-auth/react';
import type { CartLine } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const count = useCartStore(selectCartCount);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            Bella<span className="text-accent">Vista</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Account" asChild>
            <Link href="/account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            className="relative"
            asChild
          >
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </header>
  );
}

/** Client island for adding a dish to the persistent cart. */
export function AddToCartButton({
  item,
  withQuantity = false,
  className,
}: {
  item: Omit<CartLine, 'quantity'>;
  withQuantity?: boolean;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item, withQuantity ? qty : 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!withQuantity) {
    return (
      <Button variant="accent" size="sm" className={className} onClick={handleAdd}>
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {added ? 'Added' : 'Add'}
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center rounded-md border border-border">
        <button
          type="button"
          aria-label="Decrease quantity"
          className="px-3 py-2 text-muted-foreground hover:text-foreground"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          className="px-3 py-2 text-muted-foreground hover:text-foreground"
          onClick={() => setQty((q) => q + 1)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button variant="accent" size="lg" onClick={handleAdd}>
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {added ? 'Added to cart' : 'Add to cart'}
      </Button>
    </div>
  );
}


/** Client island: serializes the persistent cart into the checkout form + live summary. */
export function CheckoutCartFields() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax + deliveryFee).toFixed(2);

  return (
    <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
      <h2 className="text-xl font-bold">Order Summary</h2>
      <input type="hidden" name="cart" value={JSON.stringify(items)} readOnly />
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((l) => (
          <li key={l.menuItemId} className="flex justify-between gap-2">
            <span className="text-muted-foreground">
              {l.quantity}× {l.name}
            </span>
            <span>{formatCurrency(l.price * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd>{formatCurrency(tax)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery (if applicable)</dt>
          <dd>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-bold text-accent">{formatCurrency(total)}</dd>
        </div>
      </dl>
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={items.length === 0}>
        Place order
      </Button>
      {items.length === 0 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Your cart is empty.</p>
      )}
    </aside>
  );
}

/** Client island: clears the persistent cart once an order is confirmed. */
export function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}


/** Client island: sign the user out. */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      Sign out
    </Button>
  );
}
