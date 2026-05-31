import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Users' };

/** Admin users (Phase 1 skeleton). Phase 7: search, role change, deactivate. */
export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="mt-4 text-muted-foreground">User management will be implemented here.</p>
    </div>
  );
}
