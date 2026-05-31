import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page is off the menu</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
