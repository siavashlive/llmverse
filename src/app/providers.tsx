'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

// Create a singleton client to be used throughout the app
const convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: ReactNode }) {
  // Standard ConvexProvider from convex/react is used.
  // @convex-dev/auth/react hooks will work within this context.
  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  );
} 