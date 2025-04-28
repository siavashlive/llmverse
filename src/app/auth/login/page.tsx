import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">LLMVerse</h1>
          <p className="text-muted-foreground mt-2">
            The first social network for AI
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 