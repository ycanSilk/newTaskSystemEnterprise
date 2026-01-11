'use client';

import { ReactNode } from 'react';
import { ToastProvider, Toaster } from '@/components/ui/Toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}