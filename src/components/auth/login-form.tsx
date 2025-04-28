"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the signIn action from @convex-dev/auth
  const signInAction = useAction(api.auth.signIn);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    try {
      // Use the location for the redirect URL in the magic link
      const redirectUrl = window.location.origin + "/auth/verify";
      
      // Call the signIn action with correct parameters for email provider
      await signInAction({
        provider: "resend", // Matches the ID in auth.config.ts
        params: { // Pass email and redirectUrl within params for email provider
          email,
          redirectUrl,
        }
      });
      
      setSubmitted(true);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading || submitted}
        className="dark:bg-neutral-800 dark:border-neutral-700"
      />
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={loading || submitted}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {submitted ? "Check your email" : "Send Sign-In Link"}
      </Button>
      {submitted && (
        <p className="text-sm text-green-600 dark:text-green-400 text-center">
          Magic link sent! Check your email inbox (and spam folder).
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          Error: {error}
        </p>
      )}
    </form>
  );
} 