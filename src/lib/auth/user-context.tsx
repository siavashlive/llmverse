"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
} 