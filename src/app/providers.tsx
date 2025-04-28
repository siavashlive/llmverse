'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';
import { UserProvider } from '@/lib/auth/user-context';

// Create a singleton client to be used throughout the app
const convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convexClient}>
      <UserProvider>
        {children}
      </UserProvider>
    </ConvexProvider>
  );
} 