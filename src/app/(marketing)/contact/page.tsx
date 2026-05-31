import type { Metadata } from 'next';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { CalendarDays, Clock, Users, MapPin, Phone, Mail } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession, requireUser } from '@/lib/auth/guards';
import { SITE } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Contact & Reservations' };
export const dynamic = 'force-dynamic';

const RES_STATUS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const input = 'h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none ring-ring focus-visible:ring-2';

export default async function ContactPage() {
  const session = await getSession();

  const reservations = session?.user
    ? await prisma.reservation.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
      })
    : [];

  const me = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true } })
    : null;

  async function createReservation(formData: FormData) {
    'use server';
    const user = await requireUser('/contact');
    const date = String(formData.get('date') ?? '');
    const time = String(formData.get('time') ?? '');
    const when = new Date(`${date}T${time || '19:00'}`);
    if (Number.isNaN(when.getTime())) return;
    const partySize = Math.min(20, Math.max(1, Number(formData.get('partySize')) || 2));
    const name = String(formData.get('name') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    if (!name || !phone) return;
    await prisma.reservation.create({
      data: {
        userId: user.id,
        name,
        phone,
        partySize,
        date: when,
        notes: String(formData.get('notes') ?? '').trim() || null,
      },
    });
    revalidatePath('/contact');
    revalidatePath('/admin');
  }

  async function cancelReservation(formData: FormData) {
    'use server';
    const user = await requireUser('/contact');
    const id = String(formData.get('id') ?? '');
    await prisma.reservation.updateMany({
      where: { id, userId: user.id, status: { in: ['PENDING', 'CONFIRMED'] } },
      data: { status: 'CANCELLED' },
    });
    revalidatePath('/contact');
    revalidatePath('/admin');
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="container py-16">
      <p className="eyebrow">Get in touch</p>
      <h1 className="mt-3 font-display text-5xl font-bold md:text-6xl">Visit Bella Vista</h1>
      <div className="mt-5 h-px w-20 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Reservation form */}
        <section>
          <h2 className="font-display text-3xl font-bold">Reserve a table</h2>
          <p className="mt-2 text-muted-foreground">
            Secure your table at New York’s favourite trattoria.
          </p>

          {!session?.user ? (
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Please{' '}
                <Link href="/login?callbackUrl=/contact" className="text-primary hover:underline">
                  sign in
                </Link>{' '}
                to book and manage your reservations.
              </p>
            </div>
          ) : (
            <form action={createReservation} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Date
                </span>
                <input type="date" name="date" min={today} required defaultValue={today} className={input} />
              </label>
              <label className="text-sm">
                <span className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Time
                </span>
                <input type="time" name="time" required defaultValue="19:00" className={input} />
              </label>
              <label className="text-sm">
                <span className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" /> Guests
                </span>
                <input type="number" name="partySize" min={1} max={20} defaultValue={2} className={input} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-muted-foreground">Phone</span>
                <input name="phone" required defaultValue={me?.phone ?? ''} className={input} />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-muted-foreground">Name</span>
                <input name="name" required defaultValue={me?.name ?? ''} className={input} />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-muted-foreground">Special requests (optional)</span>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Allergies, occasions, seating preferences…"
                  className="w-full rounded-md border border-input bg-card p-3 text-sm outline-none ring-ring focus-visible:ring-2"
                />
              </label>
              <div className="sm:col-span-2">
                <button className="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Request reservation
                </button>
              </div>
            </form>
          )}

          {/* History */}
          {session?.user && (
            <div className="mt-12">
              <h3 className="font-display text-2xl font-bold">Your reservations</h3>
              {reservations.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No reservations yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {reservations.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="text-sm">
                        <p className="font-semibold">
                          {formatDate(r.date)} ·{' '}
                          {r.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                        <p className="text-muted-foreground">
                          Party of {r.partySize}
                          {r.notes ? ` · ${r.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                          {RES_STATUS[r.status]}
                        </span>
                        {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                          <form action={cancelReservation}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="text-xs text-muted-foreground hover:text-destructive">
                              Cancel
                            </button>
                          </form>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Contact details */}
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Find us</h2>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {SITE.address}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-accent" /> {SITE.phone}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0 text-accent" /> {SITE.email}
          </p>
          <div className="border-t border-border pt-4">
            <h3 className="mb-2 text-sm font-semibold">Hours</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {SITE.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
