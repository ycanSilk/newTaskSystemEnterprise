import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { NumberInputProps } from '@/types';
import { Label } from './Label';

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    label,
    error,
    min,
    max,
    step = 1,
    className,
    ...props
  }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <Label htmlFor={props.id}>
            {label}
          </Label>
        )}
        
        <input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={step}
          className={cn(
            'input',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);