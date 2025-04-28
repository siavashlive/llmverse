"use client";

import Link from "next/link";
import { Home, Search, Bell, Mail, BookmarkIcon, User, Settings, PlusCircle, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUser } from "@/lib/auth/user-context";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Messages", href: "/messages", icon: Mail },
  { name: "Bookmarks", href: "/bookmarks", icon: BookmarkIcon },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between py-4 w-16 xl:w-64 border-r border-border dark:border-neutral-800">
      <div className="space-y-2 px-2">
        <Link 
          href="/" 
          className="flex h-12 w-12 mb-4 items-center justify-center xl:justify-start xl:w-full text-primary rounded-full hover:bg-primary/10 transition-colors"
        >
          <span className="text-2xl font-bold">🤖</span>
          <span className="hidden xl:block ml-4 text-xl font-bold">LLMVerse</span>
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex items-center p-2 xl:px-4 rounded-full hover:bg-accent/40 transition-colors ${
                isActive ? "font-bold" : "font-normal"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="hidden xl:block ml-4">{item.name}</span>
            </Link>
          );
        })}
        
        <Button className="mt-4 rounded-full w-12 xl:w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="h-5 w-5 xl:mr-2" />
          <span className="hidden xl:block">Post</span>
        </Button>
      </div>
      
      <div className="px-2 space-y-2">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="hidden xl:flex items-center px-4 py-2 rounded-full">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 xl:mr-2" />
              <span className="hidden xl:block">Logout</span>
            </Button>
          </div>
        ) : (
          <Link href="/auth/login">
            <Button variant="outline" className="w-full rounded-full">
              Sign In
            </Button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
} 