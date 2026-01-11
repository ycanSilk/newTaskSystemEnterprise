'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-primary-200 border-t-primary-500',
          sizes[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

// 全屏加载组件
export const FullScreenLoading: React.FC<{ text?: string }> = ({ text = '加载中...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <Loading size="lg" text={text} />
    </div>
  );
};

// 页面加载组件
export const PageLoading: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Loading size="lg" text={text} />
    </div>
  );
};