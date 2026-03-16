'use client';
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

// DropdownMenu上下文
type DropdownMenuContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

// DropdownMenuProps类型定义
export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// DropdownMenu组件实现
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  open: openProp,
  onOpenChange,
}) => {
  const [openState, setOpenState] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  const open = openProp ?? openState;
  const handleOpenChange = (newOpen: boolean) => {
    if (openProp === undefined) {
      setOpenState(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleOpenChange]);

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// DropdownMenuTriggerProps类型定义
export interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

// DropdownMenuTrigger组件实现
export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  asChild = false,
  children,
  className,
}) => {
  const context = useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const { onOpenChange, triggerRef } = context;
  const handleClick = () => {
    onOpenChange(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ref: triggerRef,
      onClick: handleClick,
      className: cn(className, (children as React.ReactElement).props.className),
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200',
        className
      )}
    >
      {children}
      <DownOutlined className="h-4 w-4" />
    </button>
  );
};

// DropdownMenuContentProps类型定义
export interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  children: React.ReactNode;
  className?: string;
}

// DropdownMenuContent组件实现
export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  align = 'start',
  alignOffset = 0,
  children,
  className,
}) => {
  const context = useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  const { open, triggerRef } = context;

  // 根据trigger位置定位content
  const getPositionStyles = () => {
    if (!triggerRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentStyles = {
      position: 'fixed' as const,
      zIndex: 50,
      top: `${triggerRect.bottom + window.scrollY}px`,
      left: `${triggerRect.left + window.scrollX}px`,
    };
    
    return contentStyles;
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        'min-w-[160px] rounded-md bg-white shadow-lg p-1 focus:outline-none',
        className
      )}
      style={getPositionStyles()}
    >
      {children}
    </div>
  );
};

// DropdownMenuItemProps类型定义
export interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

// DropdownMenuItem组件实现
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-between gap-2 w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span>{children}</span>
      <RightOutlined className="h-4 w-4 text-gray-400" />
    </button>
  );
};