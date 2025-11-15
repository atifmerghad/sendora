'use client';

import { Toaster as ChakraToaster, ToastRoot, ToastTitle, ToastDescription, ToastCloseTrigger, ToastIndicator, ToastActionTrigger } from '@chakra-ui/react';
import { toaster } from '@/lib/toast';

export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => {
        if (!toast) return null;
        const toastId = toast.id || String(Math.random());
        return (
          <ToastRoot key={toastId}>
            <ToastIndicator />
            {toast.title && <ToastTitle>{String(toast.title)}</ToastTitle>}
            {toast.description && <ToastDescription>{String(toast.description)}</ToastDescription>}
            {toast.action && (
              <ToastActionTrigger>
                {toast.action.label}
              </ToastActionTrigger>
            )}
            <ToastCloseTrigger />
          </ToastRoot>
        );
      }}
    </ChakraToaster>
  );
}

