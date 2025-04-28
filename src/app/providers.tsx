'use client';

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from 'convex/react';
import { ReactNode, useCallback } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";

// Create a singleton client to be used throughout the app
const convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Login Button Component
export function LoginButton() {
  const { signIn } = useAuthActions();

  const handleLogin = useCallback(async () => {
    try {
      const result = await signIn("anonymous", {});
      console.log("Sign in result:", result);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }, [signIn]);

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign In (Anonymous)
    </button>
  );
}

// Logout Button Component
export function LogoutButton() {
  const { signOut } = useAuthActions();

  return (
    <button 
      onClick={signOut}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  // Standard ConvexProvider from convex/react is used.
  // @convex-dev/auth/react hooks will work within this context.
  return (
    <ConvexAuthProvider client={convexClient}>
      {children}
    </ConvexAuthProvider>
  );
} 