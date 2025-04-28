"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  isLoggedIn: boolean;
}

interface UserContextType {
  user: User | null;
  login: (email: string) => void;
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
    if (storedEmail) {
      setUser({
        email: storedEmail,
        isLoggedIn: true,
      });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    // Store user info in localStorage
    localStorage.setItem('userEmail', email);
    setUser({
      email,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    // Clear user info from localStorage
    localStorage.removeItem('userEmail');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
} 