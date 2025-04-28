"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/auth/user-context";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useUser();
  
  const [error, setError] = useState<string | null>(null);
  // Temporarily fix the missing auth property error by using any type
  // This will be resolved once Convex has generated the proper types
  const verifyToken = useMutation(api.auth?.verifyToken as any);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Missing authentication token");
        return;
      }

      try {
        // Call the mutation to verify the token
        const result = await verifyToken({ token });
        
        // Use the user context to set the user as logged in
        login(result.email);
        
        // Redirect to home page
        router.push("/");
      } catch (err: any) {
        setError(err.message || "Failed to verify token");
      }
    }

    verify();
  }, [token, verifyToken, router, login]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          <p>{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="text-primary hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Verifying your login...</h1>
        <p className="text-muted-foreground">Please wait while we verify your authentication</p>
      </div>
    </div>
  );
} 