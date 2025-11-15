'use client';

import { useEffect, useState } from 'react';

export function useColorMode() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('chakra-ui-color-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = stored || (prefersDark ? 'dark' : 'light');
    setColorMode(initialMode as 'light' | 'dark');

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

    return () => observer.disconnect();
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('chakra-ui-color-mode', newMode);
    
    // Update document classes/attributes for Chakra UI v3
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return { colorMode, toggleColorMode };
}

