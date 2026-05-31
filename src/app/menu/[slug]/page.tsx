interface DishPageProps {
  params: { slug: string };
}

/**
 * Dish detail (Phase 1 skeleton).
 * Phase 3 adds: imagery, dietary badges, add-to-cart with quantity/notes,
 * and the reviews list + review form (Phase 6).
 */
export default function DishPage({ params }: DishPageProps) {
  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold capitalize">{params.slug.replace(/-/g, ' ')}</h1>
      <p className="mt-4 text-muted-foreground">
        Dish detail and reviews will be implemented in the catalog and reviews phases.
      </p>
    </div>
  );
}
