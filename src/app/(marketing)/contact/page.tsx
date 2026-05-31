import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = { title: 'Contact' };

/** Contact (Phase 1 skeleton): hours, address, map, and a contact form later. */
export default function ContactPage() {
  return (
    <div className="container py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-accent">Get in touch</p>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Visit Bella Vista</h1>
      <div className="mt-6 space-y-1 text-muted-foreground">
        <p>{SITE.address}</p>
        <p>{SITE.phone}</p>
        <p>{SITE.email}</p>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Map and reservation form will be implemented in the foundations phase.
      </p>
    </div>
  );
}
