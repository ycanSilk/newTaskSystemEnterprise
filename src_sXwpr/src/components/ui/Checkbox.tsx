'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'checkbox',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e);
            }
            if (props.onCheckedChange) {
              props.onCheckedChange(e.target.checked);
            }
          }}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
        {error && (
          <p className="text-sm text-red-600 ml-2">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';