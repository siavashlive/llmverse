"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./user-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete and user is not logged in, redirect to login
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // If user is authenticated, show children
  if (user) {
    return <>{children}</>;
  }

  // Otherwise, show nothing (will redirect in useEffect)
  return null;
} 