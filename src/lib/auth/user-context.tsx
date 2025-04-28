"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConvexAuth } from "convex/react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

// Initialize the Convex client for direct API calls
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

interface User {
  email: string;
  isLoggedIn: boolean;
  userId?: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, userId?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedEmail = localStorage.getItem('userEmail');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedEmail) {
      setUser({
        email: storedEmail,
        userId: storedUserId || undefined,
        isLoggedIn: true,
      });
    }
    
    setIsLoading(false);
  }, []);

  // Update user state based on Convex auth status
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated && user) {
        // User context thinks user is logged in, but Convex disagrees
        // Clear the localStorage and reset state
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        setUser(null);
      }
    }
  }, [isAuthenticated, isAuthLoading, user]);

  const login = (email: string, userId?: string) => {
    // Store user info in localStorage
    localStorage.setItem('userEmail', email);
    if (userId) {
      localStorage.setItem('userId', userId);
    }
    
    setUser({
      email,
      userId,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    // Clear user info from localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setUser(null);
    router.push('/auth/login');
    
    // Optional: You might want to add a server-side logout call here
    // if you implement session invalidation
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading: isLoading || isAuthLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
} 