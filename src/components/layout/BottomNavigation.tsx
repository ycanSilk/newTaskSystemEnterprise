'use client';

import React from 'react';
import { EncryptedLink } from './EncryptedLink';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types';

interface BottomNavigationProps {
  items: NavigationItem[];
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <nav className="bg-white px-1 py-2 safe-area-bottom items-center justify-around">
      <div className="flex items-center justify-around">
        {items.map((item, index) => {
          const isActive = pathname === item.path || item.active;
          
          return (
                <EncryptedLink
                  key={index}
                  href={item.path as any}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1',
                    'touch-target transition-all duration-200'
                  )}
                >
              <span className={cn(
                'text-lg  w-7 h-7 flex items-center justify-center rounded-full',
                isActive 
                  ? 'text-blue-500' : 'text-gray-600'
                  
              )}>
                {item.icon}
              </span>
              <span className={cn(
                'text-xs truncate',
                isActive ? 'text-blue-500' : 'text-gray-600'
              )}>
                {item.label}
              </span>
            </EncryptedLink>
          );
        })}
      </div>
    </nav>
  );
};