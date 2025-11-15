'use client';

import { useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';

export function DirectionHandler() {
  const { locale } = useLocale();

  useEffect(() => {
    // Update HTML lang and dir attributes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale]);

  return null;
}

