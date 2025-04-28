"use client";

import { MainLayout } from "@/components/layout/main-layout";
import AuthGuard from "@/lib/auth/auth-guard";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
} 