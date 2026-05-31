import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { Trash2, Pencil } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { slugify } from '@/lib/utils';

export const metadata: Metadata = { title: 'Manage Categories' };
export const dynamic = 'force-dynamic';

const input = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || 'category';
  let slug = base;
  for (let n = 2; ; n++) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n}`;
  }
}

function revalidate() {
  revalidatePath('/admin/categories');
  revalidatePath('/admin/menu');
  revalidatePath('/menu');
}

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { menuItems: true } } },
  });

  async function createCategory(formData: FormData) {
    'use server';
    await requireAdmin();
    const name = String(formData.get('name') ?? '').trim();
    if (!name) return;
    await prisma.category.create({
      data: {
        name,
        slug: await uniqueSlug(name),
        description: String(formData.get('description') ?? '').trim() || null,
        image: String(formData.get('image') ?? '').trim() || null,
        sortOrder: Number(formData.get('sortOrder')) || 0,
      },
    });
    revalidate();
  }

  async function updateCategory(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const name = String(formData.get('name') ?? '').trim();
    if (!id || !name) return;
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: await uniqueSlug(name, id),
        description: String(formData.get('description') ?? '').trim() || null,
        image: String(formData.get('image') ?? '').trim() || null,
        sortOrder: Number(formData.get('sortOrder')) || 0,
        isActive: formData.get('isActive') === 'on',
      },
    });
    revalidate();
  }

  async function deleteCategory(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    if (!id) return;
    const count = await prisma.menuItem.count({ where: { categoryId: id } });
    if (count === 0) await prisma.category.delete({ where: { id } });
    revalidate();
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Categories</h1>

      <details className="rounded-xl border border-border bg-card p-6">
        <summary className="cursor-pointer text-lg font-semibold">+ Add a category</summary>
        <form action={createCategory} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="Name" required className={input} />
          <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={categories.length} className={input} />
          <input name="image" placeholder="Image URL" className={`${input} sm:col-span-2`} />
          <input name="description" placeholder="Description" className={`${input} sm:col-span-2`} />
          <button className="h-10 w-fit rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
            Create category
          </button>
        </form>
      </details>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {categories.map((c) => (
            <li key={c.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {c.name}{' '}
                    {!c.isActive && (
                      <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c._count.menuItems} dish{c._count.menuItems === 1 ? '' : 'es'} · order {c.sortOrder}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <details>
                    <summary className="flex cursor-pointer items-center rounded-md p-2 hover:bg-muted">
                      <Pencil className="h-4 w-4" />
                    </summary>
                    <form
                      action={updateCategory}
                      className="mt-3 grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2"
                    >
                      <input type="hidden" name="id" value={c.id} />
                      <input name="name" defaultValue={c.name} className={input} />
                      <input name="sortOrder" type="number" defaultValue={c.sortOrder} className={input} />
                      <input name="image" defaultValue={c.image ?? ''} placeholder="Image URL" className={`${input} sm:col-span-2`} />
                      <input name="description" defaultValue={c.description ?? ''} placeholder="Description" className={`${input} sm:col-span-2`} />
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isActive" defaultChecked={c.isActive} /> Active
                      </label>
                      <button className="h-10 w-fit rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
                        Save
                      </button>
                    </form>
                  </details>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      title={c._count.menuItems > 0 ? 'Remove dishes first' : 'Delete'}
                      aria-label="Delete category"
                      disabled={c._count.menuItems > 0}
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
