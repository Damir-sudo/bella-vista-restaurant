import Link from 'next/link';
import { Facebook, Instagram, MapPin, Phone, Mail, Twitter } from 'lucide-react';
import { MAIN_NAV, SITE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-gradient-to-b from-muted/30 to-background">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4 space-y-5">
            <span className="font-display text-3xl font-bold tracking-tight">
              Bella<span className="text-accent">Vista</span>
            </span>
            <div className="hairline" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{SITE.description}</p>
            <div className="flex gap-3 pt-1">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-foreground/80 transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {SITE.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span className="text-foreground/80">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Visit Us
            </h4>
            <address className="space-y-3 text-sm not-italic text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {SITE.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-accent" /> {SITE.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-accent" /> {SITE.email}
              </p>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Crafted with passion in New York.
          </p>
          <p className="tracking-wide">Buon Appetito 🍷</p>
        </div>
      </div>
    </footer>
  );
}
