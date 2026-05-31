import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Categories' };

/** Admin categories CRUD (Phase 1 skeleton). Phase 7: sortable list + edit. */
export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-4 text-muted-foreground">Category management will be implemented here.</p>
    </div>
  );
}
