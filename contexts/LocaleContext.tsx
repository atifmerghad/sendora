'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('fr');

  useEffect(() => {
    // Load locale from localStorage
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') || 'fr';
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      // Trigger a custom event to notify Providers to update
      window.dispatchEvent(new CustomEvent('locale-changed', { detail: newLocale }));
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

