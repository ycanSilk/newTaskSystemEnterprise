'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = true,
  shadow = 'sm',
  onClick,
}) => {
  const baseClasses = 'card';
  const paddingClasses = padding ? 'card-padding' : '';
  
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md', 
    lg: 'shadow-lg',
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        paddingClasses,
        shadowClasses[shadow],
        onClick && 'cursor-pointer hover:shadow-md transition-shadow touch-feedback',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};