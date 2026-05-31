import Link from 'next/link';
import { MAIN_NAV, SITE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <span className="font-display text-2xl font-bold text-primary">
            Bella<span className="text-accent">Vista</span>
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">{SITE.tagline}.</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Hours</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {SITE.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Visit</h4>
          <address className="space-y-2 text-sm not-italic text-muted-foreground">
            <p>{SITE.address}</p>
            <p>{SITE.phone}</p>
            <p>{SITE.email}</p>
          </address>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
