import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Create account' };

/**
 * Register (Phase 1 skeleton).
 * Phase 5 adds: react-hook-form + zod form posting to /api/auth/register,
 * then auto sign-in on success.
 */
export default function RegisterPage() {
  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        The registration form will be implemented in the auth phase.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
