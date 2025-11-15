'use client';

import { useEffect, useState } from 'react';

export function useColorModeValue(lightValue: string, darkValue: string): string {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    // Get initial color mode from localStorage or system preference
    const stored = localStorage.getItem('chakra-ui-color-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = stored || (prefersDark ? 'dark' : 'light');
    setColorMode(initialMode as 'light' | 'dark');

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const stored = localStorage.getItem('chakra-ui-color-mode');
      if (!stored) {
        setColorMode(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // Listen for storage changes (when color mode is toggled)
    const handleStorageChange = () => {
      const stored = localStorage.getItem('chakra-ui-color-mode');
      if (stored) {
        setColorMode(stored as 'light' | 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', handleStorageChange);

    // Also check for class changes on document element (Chakra UI v3 might use this)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark') ||
                     document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        setColorMode('dark');
      } else {
        const stored = localStorage.getItem('chakra-ui-color-mode');
        if (stored) {
          setColorMode(stored as 'light' | 'dark');
        } else {
          setColorMode('light');
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  return colorMode === 'dark' ? darkValue : lightValue;
}
