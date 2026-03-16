'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from '@/types';

// Tabs组件容器
export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: valueProp,
  onValueChange,
  children,
  className,
}) => {
  // 内部状态管理，如果没有提供外部value
  const [localValue, setLocalValue] = useState<string | undefined>(defaultValue);
  
  // 决定使用内部状态还是外部传入的value
  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : localValue;
  
  // 处理值变化
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setLocalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  // 克隆子元素，传递context
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      
      // 为TabsList和TabsTrigger传递onChange函数
      if (child.type === TabsList || child.type === TabsTrigger) {
        return React.cloneElement(child, {
          onValueChange: handleValueChange,
          currentValue,
        });
      }
      
      // 为TabsContent传递当前值进行匹配
      if (child.type === TabsContent) {
        return React.cloneElement(child, {
          currentValue,
        });
      }
      
      return child;
    });
  };
  
  return (
    <div className={cn('w-full', className)}>
      {renderChildren()}
    </div>
  );
};

// TabsList组件 - 标签列表容器
export const TabsList: React.FC<TabsListProps & { onValueChange?: (value: string) => void; currentValue?: string }> = ({
  children,
  className,
  onValueChange,
  currentValue,
}) => {
  // 克隆子元素，传递onValueChange和currentValue
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      
      if (child.type === TabsTrigger) {
        return React.cloneElement(child, {
          onValueChange,
          currentValue,
        });
      }
      
      return child;
    });
  };
  
  return (
    <div 
      className={cn(
        'flex border-b border-gray-200 w-full',
        className
      )}
    >
      {renderChildren()}
    </div>
  );
};

// TabsTrigger组件 - 单个标签触发器
export const TabsTrigger: React.FC<TabsTriggerProps & { onValueChange?: (value: string) => void; currentValue?: string }> = ({
  value,
  children,
  disabled = false,
  className,
  onValueChange,
  currentValue,
}) => {
  const isActive = value === currentValue;
  
  const handleClick = () => {
    if (!disabled && onValueChange) {
      onValueChange(value);
    }
  };
  
  return (
    <button
      type="button"
      className={cn(
        'px-4 py-2 font-medium text-sm transition-all duration-200',
        isActive 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// TabsContent组件 - 标签内容区域
export const TabsContent: React.FC<TabsContentProps & { currentValue?: string }> = ({
  value,
  children,
  className,
  currentValue,
}) => {
  const isActive = value === currentValue;
  
  return (
    <div
      className={cn(
        'py-4',
        !isActive && 'hidden',
        className
      )}
    >
      {children}
    </div>
  );
};