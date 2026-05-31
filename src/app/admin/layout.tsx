import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guards';
import { ADMIN_NAV } from '@/lib/constants';

/**
 * Admin shell (Phase 1 skeleton). Server-guarded by requireAdmin().
 * Phase 7 replaces the simple sidebar with an active-state nav + topbar.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container grid gap-8 py-10 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <p className="mb-4 font-display text-xl font-bold text-primary">Admin</p>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
