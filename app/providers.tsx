'use client';

import { ChakraProvider } from '@chakra-ui/react';
import customTheme from '@/theme';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { Toaster } from '@/components/Toaster';
import { DirectionHandler } from '@/components/DirectionHandler';
import { useState, useEffect } from 'react';

// Default locale
const defaultLocale = 'fr';

// Load messages - using require for compatibility
let frMessages: any;
let enMessages: any;
let arMessages: any;

try {
  frMessages = require('@/messages/fr.json');
} catch {
  frMessages = {};
}

try {
  enMessages = require('@/messages/en.json');
} catch {
  enMessages = {};
}

try {
  arMessages = require('@/messages/ar.json');
} catch {
  arMessages = {};
}

const messagesMap: Record<string, any> = {
  fr: frMessages,
  en: enMessages,
  ar: arMessages,
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState(defaultLocale);
  const [messages, setMessages] = useState(messagesMap[defaultLocale] || frMessages);

  useEffect(() => {
    // On client side, try to get locale from localStorage or default to 'fr'
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') || defaultLocale;
      if (savedLocale && messagesMap[savedLocale]) {
        setLocale(savedLocale);
        setMessages(messagesMap[savedLocale]);
      }

      // Listen for locale changes
      const handleLocaleChange = (event: CustomEvent) => {
        const newLocale = event.detail;
        if (messagesMap[newLocale]) {
          setLocale(newLocale);
          setMessages(messagesMap[newLocale]);
        }
      };

      window.addEventListener('locale-changed', handleLocaleChange as EventListener);
      return () => {
        window.removeEventListener('locale-changed', handleLocaleChange as EventListener);
      };
    }
  }, []);

  return (
    <LocaleProvider>
      <DirectionHandler />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ChakraProvider value={customTheme}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ChakraProvider>
      </NextIntlClientProvider>
    </LocaleProvider>
  );
}

