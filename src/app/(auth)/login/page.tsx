'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { safeInternalPath } from '@/lib/utils';

const input =
  'h-11 w-full rounded-md border border-input bg-card px-4 text-sm outline-none ring-ring focus-visible:ring-2';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeInternalPath(params.get('callbackUrl'), '/account');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: false,
      email: String(data.get('email')),
      password: String(data.get('password')),
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Sign in to your Bella Vista account.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password" required className={input} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
