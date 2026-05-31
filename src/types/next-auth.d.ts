import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

// Augment NextAuth types so `session.user.id` and `session.user.role` are typed.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
