'use client';

import React from 'react';
import Link from 'next/link';
import { encryptRoute } from '@/lib/routeEncryption';
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
  
  // 加密路径
  const getEncryptedPath = (path: string): string => {
    // 如果是外部链接或已经加密的链接，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 如果是哈希链接，直接返回
    if (path.startsWith('#')) {
      return path;
    }
    
    // 解析路径，提取查询参数
    const [pathWithoutQuery, query] = path.split('?');
    
    // 只加密路径部分，保留查询参数
    const pathParts = pathWithoutQuery.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      // 获取前两级路由
      const firstTwoLevels = `/${pathParts[0]}/${pathParts[1]}`;
      // 加密前两级路由
      const encrypted = encryptRoute(firstTwoLevels);
      // 构建新的路径
      const remainingPath = pathParts.slice(2).join('/');
      const newPath = `/${encrypted}${remainingPath ? `/${remainingPath}` : ''}`;
      
      // 添加查询参数
      return query ? `${newPath}?${query}` : newPath;
    }
    
    return path;
  };
  
  const encryptedHref = getEncryptedPath(href);
  
  return (
    <Link href={encryptedHref} className={className} {...props}>
      {children}
    </Link>
  );
};
