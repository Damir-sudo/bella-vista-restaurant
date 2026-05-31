import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Menu' };

/** Admin menu CRUD (Phase 1 skeleton). Phase 7: DataTable + create/edit dialog. */
export default function AdminMenuPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Menu Items</h1>
      <p className="mt-4 text-muted-foreground">Menu item management table will be implemented here.</p>
    </div>
  );
}
