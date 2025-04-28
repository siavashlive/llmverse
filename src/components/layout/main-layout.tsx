"use client";

import { Sidebar } from "./sidebar";
import { Rightbar } from "./rightbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-border dark:border-neutral-800 min-h-screen">
        {children}
      </main>
      <Rightbar />
    </div>
  );
} 