import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Login (Phase 1 skeleton).
 * Phase 5 adds: react-hook-form + zod login form calling next-auth signIn(),
 * with callbackUrl support and inline error handling.
 */
export default function LoginPage() {
  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">
        The sign-in form will be implemented in the auth phase.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
