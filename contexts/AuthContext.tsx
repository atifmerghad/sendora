'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, SignupData } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('sendora_user');
      const storedToken = localStorage.getItem('sendora_token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('sendora_user');
          localStorage.removeItem('sendora_token');
        }
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = { ...data.user };
        delete userData.password; // Don't store password in state
        
        setUser(userData);
        localStorage.setItem('sendora_user', JSON.stringify(userData));
        localStorage.setItem('sendora_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = { ...data.user };
        delete newUser.password;
        
        setUser(newUser);
        localStorage.setItem('sendora_user', JSON.stringify(newUser));
        localStorage.setItem('sendora_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sendora_user');
    localStorage.removeItem('sendora_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

