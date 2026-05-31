import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Flame } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from '@/components/layout/navbar';

export const dynamic = 'force-dynamic';

interface DishPageProps {
  params: { slug: string };
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

  const related = await prisma.menuItem.findMany({
    where: { categoryId: dish.categoryId, isAvailable: true, NOT: { id: dish.id } },
    take: 3,
    select: { id: true, name: true, slug: true, price: true, image: true },
  });

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
          <p className="text-sm uppercase tracking-[0.3em] text-accent">{dish.category.name}</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">{dish.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-accent">
            {formatCurrency(Number(dish.price))}
          </p>
          <p className="mt-6 text-muted-foreground">{dish.description}</p>

          {dish.ingredients && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Ingredients:</span>{' '}
              {dish.ingredients}
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

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">More from {dish.category.name}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/menu/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
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
