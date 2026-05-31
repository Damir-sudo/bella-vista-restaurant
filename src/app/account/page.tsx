import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { SignOutButton } from '@/components/layout/navbar';

export const metadata: Metadata = { title: 'My Account' };
export const dynamic = 'force-dynamic';

const input = 'h-11 w-full rounded-md border border-input bg-card px-4 text-sm outline-none ring-ring focus-visible:ring-2';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { ok?: string; err?: string };
}) {
  const sessionUser = await requireUser('/account');
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect('/login');

  async function updateProfile(formData: FormData) {
    'use server';
    const me = await requireUser('/account');
    const name = String(formData.get('name') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim() || null;
    const image = String(formData.get('image') ?? '').trim() || null;
    if (!name) redirect('/account?err=profile');
    await prisma.user.update({ where: { id: me.id }, data: { name, phone, image } });
    redirect('/account?ok=profile');
  }

  async function changePassword(formData: FormData) {
    'use server';
    const me = await requireUser('/account');
    const current = String(formData.get('current') ?? '');
    const next = String(formData.get('next') ?? '');
    const dbUser = await prisma.user.findUnique({ where: { id: me.id } });
    if (!dbUser || next.length < 8) redirect('/account?err=pw');
    const valid = await bcrypt.compare(current, dbUser.passwordHash);
    if (!valid) redirect('/account?err=pw');
    await prisma.user.update({
      where: { id: me.id },
      data: { passwordHash: await bcrypt.hash(next, 10) },
    });
    redirect('/account?ok=pw');
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Profile</h1>
        <SignOutButton />
      </div>

      {searchParams.ok && (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm">
          {searchParams.ok === 'pw' ? 'Password updated.' : 'Profile updated.'}
        </p>
      )}
      {searchParams.err && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {searchParams.err === 'pw'
            ? 'Could not update password. Check your current password (new must be 8+ chars).'
            : 'Name is required.'}
        </p>
      )}

      {/* Edit profile */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Personal details</h2>
        <form action={updateProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Name</span>
            <input name="name" defaultValue={user.name} className={input} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Email</span>
            <input value={user.email} disabled className={`${input} opacity-60`} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Phone</span>
            <input name="phone" defaultValue={user.phone ?? ''} className={input} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Avatar URL</span>
            <input name="image" defaultValue={user.image ?? ''} className={input} />
          </label>
          <div className="sm:col-span-2">
            <button className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
              Save profile
            </button>
          </div>
        </form>
      </section>

      {/* Account settings — password */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Account settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Change your password.</p>
        <form action={changePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="current" type="password" placeholder="Current password" required className={input} />
          <input name="next" type="password" placeholder="New password (8+ chars)" required className={input} />
          <div className="sm:col-span-2">
            <button className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
              Update password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
