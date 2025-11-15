'use client';

import { createToaster } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
});

export function useToast() {
  return (options: {
    title?: string;
    description?: string;
    status?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    isClosable?: boolean;
    actionLabel?: string;
    onAction?: () => void;
  }) => {
    const statusMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    toaster.create({
      title: options.title,
      description: options.description,
      type: statusMap[options.status || 'info'],
      duration: options.duration || 5000,
      action: options.actionLabel && options.onAction ? {
        label: options.actionLabel,
        onClick: options.onAction,
      } : undefined,
    });
  };
}
