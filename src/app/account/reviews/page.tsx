import type { Metadata } from 'next';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Star, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'My Reviews' };
export const dynamic = 'force-dynamic';

async function recomputeRating(menuItemId: string) {
  const agg = await prisma.review.aggregate({
    where: { menuItemId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.menuItem.update({
    where: { id: menuItemId },
    data: { ratingAverage: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count },
  });
}

const input = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

export default async function AccountReviewsPage() {
  const me = await requireUser('/account/reviews');

  const reviews = await prisma.review.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: 'desc' },
    include: { menuItem: { select: { name: true, slug: true, id: true } } },
  });

  async function updateReview(formData: FormData) {
    'use server';
    const user = await requireUser('/account/reviews');
    const id = String(formData.get('id') ?? '');
    const rating = Math.min(5, Math.max(1, Number(formData.get('rating')) || 0));
    const owned = await prisma.review.findFirst({ where: { id, userId: user.id } });
    if (!owned) return;
    await prisma.review.update({
      where: { id },
      data: {
        rating,
        title: String(formData.get('title') ?? '').trim() || null,
        body: String(formData.get('body') ?? '').trim() || null,
      },
    });
    await recomputeRating(owned.menuItemId);
    revalidatePath('/account/reviews');
  }

  async function deleteReview(formData: FormData) {
    'use server';
    const user = await requireUser('/account/reviews');
    const id = String(formData.get('id') ?? '');
    const owned = await prisma.review.findFirst({ where: { id, userId: user.id } });
    if (!owned) return;
    await prisma.review.delete({ where: { id } });
    await recomputeRating(owned.menuItemId);
    revalidatePath('/account/reviews');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Your Reviews</h1>

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">You haven’t reviewed any dishes yet.</p>
          <Link href="/menu" className="mt-4 inline-block font-medium text-primary hover:underline">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <Link href={`/menu/${r.menuItem.slug}`} className="font-display text-lg font-semibold hover:text-accent">
                  {r.menuItem.name}
                </Link>
                <span className="inline-flex text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-accent' : 'opacity-30'}`} />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary">Edit review</summary>
                <form action={updateReview} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="rating" defaultValue={String(r.rating)} className={input}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                  <input name="title" defaultValue={r.title ?? ''} placeholder="Title" className={input} />
                  <textarea
                    name="body"
                    defaultValue={r.body ?? ''}
                    className="min-h-20 rounded-md border border-input bg-card p-3 text-sm"
                  />
                  <button className="h-9 w-fit rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                    Save
                  </button>
                </form>
              </details>

              {r.title && <p className="mt-2 font-medium">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}

              <form action={deleteReview} className="mt-3">
                <input type="hidden" name="id" value={r.id} />
                <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
