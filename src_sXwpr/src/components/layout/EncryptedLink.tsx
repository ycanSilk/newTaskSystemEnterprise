'use client';

import React from 'react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface EncryptedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const EncryptedLink: React.FC<EncryptedLinkProps> = ({ href, children, className, ...props }) => {
  const pathname = usePathname();
  
  // 获取路径（不再加密）
  const getEncryptedPath = (path: string): string => {
    return path;
  };
  
  const encryptedHref = getEncryptedPath(href);
  
  return (
    <Link href={encryptedHref} className={className} {...props}>
      {children}
    </Link>
  );
};
