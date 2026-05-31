import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ArrowLeft, Clock, Flame, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getSession, requireUser } from '@/lib/auth/guards';
import { AddToCartButton } from '@/components/layout/navbar';

export const dynamic = 'force-dynamic';

interface DishPageProps {
  params: { slug: string };
}

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex text-accent" aria-label={`${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < Math.round(value) ? 'fill-accent' : 'opacity-30'}`} />
      ))}
    </span>
  );
}

async function recomputeRating(menuItemId: string) {
  const agg = await prisma.review.aggregate({
    where: { menuItemId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.menuItem.update({
    where: { id: menuItemId },
    data: {
      ratingAverage: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count,
    },
  });
}

async function getDish(slug: string) {
  return prisma.menuItem.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const dish = await getDish(params.slug);
  if (!dish) return { title: 'Dish not found' };
  return { title: dish.name, description: dish.description };
}

export default async function DishPage({ params }: DishPageProps) {
  const dish = await getDish(params.slug);
  if (!dish) notFound();

  const [related, reviews, session] = await Promise.all([
    prisma.menuItem.findMany({
      where: { categoryId: dish.categoryId, isAvailable: true, NOT: { id: dish.id } },
      take: 3,
      select: { id: true, name: true, slug: true, price: true, image: true },
    }),
    prisma.review.findMany({
      where: { menuItemId: dish.id, isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    getSession(),
  ]);

  let hasOrdered = false;
  let myReview: { rating: number; title: string | null; body: string | null } | null = null;
  if (session?.user) {
    const [ordered, existing] = await Promise.all([
      prisma.orderItem.findFirst({
        where: { menuItemId: dish.id, order: { userId: session.user.id } },
        select: { id: true },
      }),
      prisma.review.findUnique({
        where: { userId_menuItemId: { userId: session.user.id, menuItemId: dish.id } },
        select: { rating: true, title: true, body: true },
      }),
    ]);
    hasOrdered = Boolean(ordered) || Boolean(existing);
    myReview = existing;
  }

  const dishId = dish.id;
  const dishSlug = dish.slug;

  async function submitReview(formData: FormData) {
    'use server';
    const user = await requireUser(`/menu/${dishSlug}`);
    const rating = Math.min(5, Math.max(1, Number(formData.get('rating')) || 0));
    const ordered = await prisma.orderItem.findFirst({
      where: { menuItemId: dishId, order: { userId: user.id } },
      select: { id: true },
    });
    const already = await prisma.review.findUnique({
      where: { userId_menuItemId: { userId: user.id, menuItemId: dishId } },
      select: { id: true },
    });
    if (!ordered && !already) return; // only customers who ordered may review
    const title = String(formData.get('title') ?? '').trim() || null;
    const body = String(formData.get('body') ?? '').trim() || null;
    await prisma.review.upsert({
      where: { userId_menuItemId: { userId: user.id, menuItemId: dishId } },
      update: { rating, title, body },
      create: { userId: user.id, menuItemId: dishId, rating, title, body },
    });
    await recomputeRating(dishId);
    revalidatePath(`/menu/${dishSlug}`);
  }

  const input = 'h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

  return (
    <div className="container py-12">
      <Link
        href={`/menu?category=${dish.category.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {dish.category.name}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-soft">
          {dish.image && (
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div>
          <p className="eyebrow">{dish.category.name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{dish.name}</h1>

          {dish.ratingCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Stars value={dish.ratingAverage} />
              <span className="font-medium">{dish.ratingAverage.toFixed(1)}</span>
              <span className="text-muted-foreground">({dish.ratingCount})</span>
            </div>
          )}

          <p className="mt-4 text-3xl font-semibold text-accent">
            {formatCurrency(Number(dish.price))}
          </p>
          <p className="mt-6 text-muted-foreground">{dish.description}</p>

          {dish.ingredients && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Ingredients:</span> {dish.ingredients}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {dish.isVegetarian && <Tag>Vegetarian</Tag>}
            {dish.isVegan && <Tag>Vegan</Tag>}
            {dish.isGlutenFree && <Tag>Gluten-free</Tag>}
          </div>

          <div className="mt-8">
            <AddToCartButton
              withQuantity
              item={{
                menuItemId: dish.id,
                name: dish.name,
                slug: dish.slug,
                price: Number(dish.price),
                image: dish.image,
              }}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {dish.prepTimeMin != null && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" /> {dish.prepTimeMin} min
              </span>
            )}
            {dish.calories != null && (
              <span className="inline-flex items-center gap-2">
                <Flame className="h-4 w-4" /> {dish.calories} kcal
              </span>
            )}
            {dish.spiceLevel !== 'NONE' && (
              <span className="inline-flex items-center gap-2 capitalize">
                <Flame className="h-4 w-4 text-primary" /> {dish.spiceLevel.toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-6 font-display text-2xl font-bold">
            Reviews{' '}
            {dish.ratingCount > 0 && (
              <span className="text-base font-normal text-muted-foreground">
                · {dish.ratingAverage.toFixed(1)} average
              </span>
            )}
          </h2>
          {reviews.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{r.user.name}</p>
                    <Stars value={r.rating} />
                  </div>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Leave a review */}
        <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h3 className="text-lg font-bold">{myReview ? 'Update your review' : 'Leave a review'}</h3>
          {!session?.user ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Please{' '}
              <Link href={`/login?callbackUrl=/menu/${dish.slug}`} className="text-primary hover:underline">
                sign in
              </Link>{' '}
              to write a review.
            </p>
          ) : !hasOrdered ? (
            <p className="mt-3 text-sm text-muted-foreground">
              You can review this dish after you’ve ordered it.
            </p>
          ) : (
            <form action={submitReview} className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Rating</span>
                <select name="rating" defaultValue={String(myReview?.rating ?? 5)} className={input}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>
              <input name="title" defaultValue={myReview?.title ?? ''} placeholder="Title (optional)" className={input} />
              <textarea
                name="body"
                defaultValue={myReview?.body ?? ''}
                placeholder="Share the details of your experience…"
                className="min-h-24 w-full rounded-md border border-input bg-card p-3 text-sm outline-none ring-ring focus-visible:ring-2"
              />
              <button className="h-10 w-full rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
                {myReview ? 'Update review' : 'Submit review'}
              </button>
            </form>
          )}
        </aside>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">More from {dish.category.name}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/menu/${r.slug}`}
                className="card-premium group overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {r.image && (
                    <Image
                      src={r.image}
                      alt={r.name}
                      fill
                      sizes="33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <h3 className="font-display text-lg font-semibold">{r.name}</h3>
                  <span className="shrink-0 font-semibold text-accent">
                    {formatCurrency(Number(r.price))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{children}</span>
  );
}
