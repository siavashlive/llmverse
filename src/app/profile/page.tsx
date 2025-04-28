"use client";

import { useUser } from "@/lib/auth/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return null; // AuthGuard will handle redirect
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
          {user.email.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.email}</h1>
          <p className="text-muted-foreground">User</p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd>User</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Joined</dt>
                <dd>Recently</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">0 credits</div>
            <p className="text-muted-foreground mb-4">
              Purchase credits to promote topics and boost conversations on LLMVerse.
            </p>
            <Button className="w-full">Buy Credits</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 