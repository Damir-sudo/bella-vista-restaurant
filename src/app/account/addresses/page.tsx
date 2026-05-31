import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { Trash2, Pencil, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'My Addresses' };
export const dynamic = 'force-dynamic';

const input = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

export default async function AccountAddressesPage() {
  const me = await requireUser('/account/addresses');

  const addresses = await prisma.address.findMany({
    where: { userId: me.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });

  function addressData(formData: FormData) {
    return {
      label: String(formData.get('label') ?? '').trim() || 'Home',
      line1: String(formData.get('line1') ?? '').trim(),
      line2: String(formData.get('line2') ?? '').trim() || null,
      city: String(formData.get('city') ?? '').trim(),
      postalCode: String(formData.get('postalCode') ?? '').trim(),
      country: String(formData.get('country') ?? '').trim() || 'United States',
      phone: String(formData.get('phone') ?? '').trim() || null,
      isDefault: formData.get('isDefault') === 'on',
    };
  }

  async function addAddress(formData: FormData) {
    'use server';
    const user = await requireUser('/account/addresses');
    const data = addressData(formData);
    if (!data.line1 || !data.city) return;
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    await prisma.address.create({ data: { ...data, userId: user.id } });
    revalidatePath('/account/addresses');
  }

  async function updateAddress(formData: FormData) {
    'use server';
    const user = await requireUser('/account/addresses');
    const id = String(formData.get('id') ?? '');
    const data = addressData(formData);
    const owned = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!owned) return;
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    await prisma.address.update({ where: { id }, data });
    revalidatePath('/account/addresses');
  }

  async function deleteAddress(formData: FormData) {
    'use server';
    const user = await requireUser('/account/addresses');
    const id = String(formData.get('id') ?? '');
    await prisma.address.deleteMany({ where: { id, userId: user.id } });
    revalidatePath('/account/addresses');
  }

  async function setDefault(formData: FormData) {
    'use server';
    const user = await requireUser('/account/addresses');
    const id = String(formData.get('id') ?? '');
    const owned = await prisma.address.findFirst({ where: { id, userId: user.id } });
    if (!owned) return;
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    await prisma.address.update({ where: { id }, data: { isDefault: true } });
    revalidatePath('/account/addresses');
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Saved Addresses</h1>

      <details className="rounded-xl border border-border bg-card p-6">
        <summary className="cursor-pointer text-lg font-semibold">+ Add an address</summary>
        <form action={addAddress} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="label" placeholder="Label (Home, Work…)" className={input} />
          <input name="phone" placeholder="Phone" className={input} />
          <input name="line1" placeholder="Address line 1" required className={`${input} sm:col-span-2`} />
          <input name="line2" placeholder="Address line 2 (optional)" className={`${input} sm:col-span-2`} />
          <input name="city" placeholder="City" required className={input} />
          <input name="postalCode" placeholder="Postal code" className={input} />
          <input name="country" placeholder="Country" defaultValue="United States" className={`${input} sm:col-span-2`} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" /> Set as default
          </label>
          <div className="sm:col-span-2">
            <button className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
              Save address
            </button>
          </div>
        </form>
      </details>

      {addresses.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No saved addresses yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">
                  {a.label}{' '}
                  {a.isDefault && (
                    <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                      Default
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  {!a.isDefault && (
                    <form action={setDefault}>
                      <input type="hidden" name="id" value={a.id} />
                      <button aria-label="Set default" title="Set default" className="rounded-md p-1.5 hover:bg-muted">
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </form>
                  )}
                  <details className="inline">
                    <summary className="flex cursor-pointer items-center rounded-md p-1.5 hover:bg-muted">
                      <Pencil className="h-4 w-4" />
                    </summary>
                    <form action={updateAddress} className="mt-3 grid gap-3 border-t border-border pt-3">
                      <input type="hidden" name="id" value={a.id} />
                      <input name="label" defaultValue={a.label} className={input} />
                      <input name="line1" defaultValue={a.line1} className={input} />
                      <input name="line2" defaultValue={a.line2 ?? ''} placeholder="Line 2" className={input} />
                      <input name="city" defaultValue={a.city} className={input} />
                      <input name="postalCode" defaultValue={a.postalCode} className={input} />
                      <input name="country" defaultValue={a.country} className={input} />
                      <input name="phone" defaultValue={a.phone ?? ''} placeholder="Phone" className={input} />
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isDefault" defaultChecked={a.isDefault} /> Default
                      </label>
                      <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                        Save
                      </button>
                    </form>
                  </details>
                  <form action={deleteAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      aria-label="Delete address"
                      title="Delete"
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                <p>{a.city} {a.postalCode}</p>
                <p>{a.country}</p>
                {a.phone && <p>{a.phone}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
