import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { Star, Trash2, Pencil } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { formatCurrency, slugify } from '@/lib/utils';
import { Prisma, type SpiceLevel } from '@prisma/client';

export const metadata: Metadata = { title: 'Manage Menu' };
export const dynamic = 'force-dynamic';

const input = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

async function ensureUniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || 'dish';
  let slug = base;
  for (let n = 2; ; n++) {
    const existing = await prisma.menuItem.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n}`;
  }
}

function dishData(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    ingredients: (String(formData.get('ingredients') ?? '').trim() || null) as string | null,
    price: new Prisma.Decimal(Number(formData.get('price')) || 0),
    image: (String(formData.get('image') ?? '').trim() || null) as string | null,
    categoryId: String(formData.get('categoryId') ?? ''),
    spiceLevel: (String(formData.get('spiceLevel') ?? 'NONE') as SpiceLevel),
    isAvailable: formData.get('isAvailable') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
    isVegetarian: formData.get('isVegetarian') === 'on',
    isVegan: formData.get('isVegan') === 'on',
    isGlutenFree: formData.get('isGlutenFree') === 'on',
  };
}

function revalidate() {
  revalidatePath('/admin/menu');
  revalidatePath('/menu');
  revalidatePath('/');
}

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const q = searchParams.q?.trim() || '';

  const [categories, dishes] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
    prisma.menuItem.findMany({
      where: q
        ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] }
        : undefined,
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
      include: { category: { select: { name: true } } },
    }),
  ]);

  async function createDish(formData: FormData) {
    'use server';
    await requireAdmin();
    const data = dishData(formData);
    if (!data.name || !data.categoryId) return;
    await prisma.menuItem.create({ data: { ...data, slug: await ensureUniqueSlug(data.name) } });
    revalidate();
  }

  async function updateDish(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const data = dishData(formData);
    if (!id || !data.name || !data.categoryId) return;
    await prisma.menuItem.update({
      where: { id },
      data: { ...data, slug: await ensureUniqueSlug(data.name, id) },
    });
    revalidate();
  }

  async function deleteDish(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    if (id) await prisma.menuItem.delete({ where: { id } });
    revalidate();
  }

  async function toggleFeatured(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    if (id) {
      await prisma.menuItem.update({
        where: { id },
        data: { isFeatured: formData.get('current') !== 'true' },
      });
      revalidate();
    }
  }

  const catOptions = () =>
    categories.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ));

  const DietaryFields = ({ d }: { d?: (typeof dishes)[number] }) => (
    <div className="flex flex-wrap gap-4 text-sm">
      <label className="inline-flex items-center gap-1.5">
        <input type="checkbox" name="isAvailable" defaultChecked={d ? d.isAvailable : true} /> Available
      </label>
      <label className="inline-flex items-center gap-1.5">
        <input type="checkbox" name="isFeatured" defaultChecked={d?.isFeatured ?? false} /> Featured
      </label>
      <label className="inline-flex items-center gap-1.5">
        <input type="checkbox" name="isVegetarian" defaultChecked={d?.isVegetarian ?? false} /> Vegetarian
      </label>
      <label className="inline-flex items-center gap-1.5">
        <input type="checkbox" name="isVegan" defaultChecked={d?.isVegan ?? false} /> Vegan
      </label>
      <label className="inline-flex items-center gap-1.5">
        <input type="checkbox" name="isGlutenFree" defaultChecked={d?.isGlutenFree ?? false} /> Gluten-free
      </label>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Menu Items</h1>
        <form method="GET" className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search dishes…" className={`${input} w-56`} />
          <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Search
          </button>
        </form>
      </div>

      {/* Create */}
      <details className="rounded-xl border border-border bg-card p-6">
        <summary className="cursor-pointer text-lg font-semibold">+ Add a new dish</summary>
        <form action={createDish} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="Name" required className={input} />
          <select name="categoryId" required className={input}>
            <option value="">Select category…</option>
            {catOptions()}
          </select>
          <input name="price" type="number" step="0.01" min="0" placeholder="Price" required className={input} />
          <input name="image" placeholder="Image URL" className={input} />
          <input name="ingredients" placeholder="Ingredients" className={`${input} sm:col-span-2`} />
          <textarea name="description" placeholder="Description" required className="sm:col-span-2 min-h-20 rounded-md border border-input bg-card p-3 text-sm" />
          <select name="spiceLevel" className={input}>
            {['NONE', 'MILD', 'MEDIUM', 'HOT'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <DietaryFields />
          </div>
          <button className="h-10 w-fit rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
            Create dish
          </button>
        </form>
      </details>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {dishes.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No dishes found.</p>
        ) : (
          <ul className="divide-y divide-border">
            {dishes.map((d) => (
              <li key={d.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {d.name}{' '}
                      {!d.isAvailable && (
                        <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          hidden
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.category.name} · {formatCurrency(Number(d.price))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={toggleFeatured}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="current" value={String(d.isFeatured)} />
                      <button
                        title="Toggle featured"
                        className="rounded-md p-2 hover:bg-muted"
                        aria-label="Toggle featured"
                      >
                        <Star
                          className={`h-4 w-4 ${d.isFeatured ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                        />
                      </button>
                    </form>
                    <details className="relative">
                      <summary className="flex cursor-pointer items-center rounded-md p-2 hover:bg-muted">
                        <Pencil className="h-4 w-4" />
                      </summary>
                      <form
                        action={updateDish}
                        className="mt-3 grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2"
                      >
                        <input type="hidden" name="id" value={d.id} />
                        <input name="name" defaultValue={d.name} className={input} />
                        <select name="categoryId" className={input} defaultValue={d.categoryId}>
                          {catOptions()}
                        </select>
                        <input name="price" type="number" step="0.01" defaultValue={Number(d.price)} className={input} />
                        <input name="image" defaultValue={d.image ?? ''} placeholder="Image URL" className={input} />
                        <input name="ingredients" defaultValue={d.ingredients ?? ''} placeholder="Ingredients" className={`${input} sm:col-span-2`} />
                        <textarea name="description" defaultValue={d.description} className="sm:col-span-2 min-h-20 rounded-md border border-input bg-card p-3 text-sm" />
                        <select name="spiceLevel" className={input} defaultValue={d.spiceLevel}>
                          {['NONE', 'MILD', 'MEDIUM', 'HOT'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <div className="sm:col-span-2">
                          <DietaryFields d={d} />
                        </div>
                        <button className="h-10 w-fit rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
                          Save changes
                        </button>
                      </form>
                    </details>
                    <form action={deleteDish}>
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        title="Delete"
                        aria-label="Delete dish"
                        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
