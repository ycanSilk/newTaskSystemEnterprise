'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SimpleToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const SimpleToast = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 3000 
}: SimpleToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-lg border shadow-lg mx-auto max-w-md',
          colors[type]
        )}
      >
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors touch-target"
        >
          ✕
        </button>
      </div>
    </div>
  );
};