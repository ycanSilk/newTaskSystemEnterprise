import React from 'react';
import { cn } from '@/lib/utils';
import { LabelProps } from '@/types';

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className,
  required = false,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium text-gray-700',
        required && 'after:ml-1 after:text-red-500 after:content-[":*"]',
        className
      )}
    >
      {children}
    </label>
  );
};