import Link from 'next/link';
import { requireUser } from '@/lib/auth/guards';
import { ACCOUNT_NAV } from '@/lib/constants';

/**
 * Account shell (Phase 1 skeleton). Server-guarded by requireUser().
 * Provides the side navigation shared by all /account/* pages.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser('/account');

  return (
    <div className="container grid gap-8 py-12 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <p className="mb-4 font-display text-xl font-bold text-primary">My Account</p>
        <nav className="flex flex-col gap-1">
          {ACCOUNT_NAV.map((item) => (
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
