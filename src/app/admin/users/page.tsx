import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { Prisma, type Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Manage Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const me = await requireAdmin();
  const q = searchParams.q?.trim() || '';

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  });

  async function setRole(formData: FormData) {
    'use server';
    const admin = await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const role = formData.get('role') === 'ADMIN' ? 'ADMIN' : ('CUSTOMER' as Role);
    if (!id || id === admin.id) return; // never change own role
    await prisma.user.update({ where: { id }, data: { role } });
    revalidatePath('/admin/users');
  }

  async function toggleActive(formData: FormData) {
    'use server';
    const admin = await requireAdmin();
    const id = String(formData.get('id') ?? '');
    if (!id || id === admin.id) return; // never deactivate self
    const u = await prisma.user.findUnique({ where: { id } });
    if (u) await prisma.user.update({ where: { id }, data: { isActive: !u.isActive } });
    revalidatePath('/admin/users');
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Users</h1>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name / email…"
            className="h-10 w-56 rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2"
          />
          <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const self = u.id === me.id;
              return (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="p-4">
                    <p className="font-medium">
                      {u.name} {self && <span className="text-xs text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="p-4">{u._count.orders}</td>
                  <td className="p-4">
                    <form action={setRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        disabled={self}
                        className="h-9 rounded-md border border-input bg-card px-2 text-sm disabled:opacity-50"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {!self && (
                        <button className="h-9 rounded-md border border-border px-3 text-xs hover:bg-muted">
                          Set
                        </button>
                      )}
                    </form>
                  </td>
                  <td className="p-4">
                    {self ? (
                      <span className="text-xs text-muted-foreground">Active</span>
                    ) : (
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            u.isActive
                              ? 'bg-accent/20 text-accent hover:bg-accent/30'
                              : 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
