'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RadioGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: any) => void;
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ label, error, children, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <legend className="block text-sm font-medium text-gray-700">
            {label}
          </legend>
        )}
        <fieldset ref={ref} className={cn(className)} {...props}>
          {children}
        </fieldset>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';