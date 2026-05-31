import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';

/** Returns the current session or null (no redirect). */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Require an authenticated user; redirect to login otherwise. */
export async function requireUser(callbackUrl = '/account') {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session.user;
}

/** Require an ADMIN; redirect non-admins away. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }
  return session.user;
}
