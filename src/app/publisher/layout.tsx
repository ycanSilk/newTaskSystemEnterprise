'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { PublisherBottomNavigation } from './components/PublisherBottomNavigation';
import { PublisherHeader } from '@/app/publisher/components/PublisherHeader';

export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 判断是否为登录页面或认证相关页面
  // 需要考虑加密后的路径，例如 /CRoXHkQADQYAShVYHw0/login
  const isAuthPage = pathname?.includes('/auth/') || 
                   pathname?.includes('/login') || 
                   pathname?.includes('/register') || 
                   pathname?.includes('/resetpwd');
  // 对于认证页面，直接渲染内容，不包含导航栏和头部
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }
  
  // 对于其他页面，渲染完整布局（头部、内容、底部导航）
  // 注意：这里不再进行前端认证，完全依赖后端API的权限验证
  // 前端只负责展示，认证逻辑由后端处理
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 使用可复用的顶部导航栏组件 */}
      <PublisherHeader />

      {/* 主要内容区域 */}
      <main className="flex-1 pb-20">
        <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Loading...</div>}>
          {children}
        </Suspense>
      </main>

      {/* 底部导航栏 - 使用可复用组件 */}
      <PublisherBottomNavigation />
    </div>
  );
}