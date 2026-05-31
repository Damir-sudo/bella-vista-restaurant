'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const input =
  'h-11 w-full rounded-md border border-input bg-card px-4 text-sm outline-none ring-ring focus-visible:ring-2';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get('name')),
      email: String(data.get('email')),
      password: String(data.get('password')),
      confirmPassword: String(data.get('confirmPassword')),
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setLoading(false);
      setError(body.error || 'Could not create account. Check your details and try again.');
      return;
    }

    await signIn('credentials', {
      redirect: false,
      email: payload.email,
      password: payload.password,
    });
    router.push('/account');
    router.refresh();
  }

  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-muted-foreground">Join Bella Vista to order and track meals.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="name" placeholder="Full name" required className={input} />
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password" required className={input} />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          required
          className={input}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
