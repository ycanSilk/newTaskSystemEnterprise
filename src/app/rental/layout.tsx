'use client';
import React, { memo, lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@/types';
import { useTokenChecker } from '@/hooks/useTokenChecker';

// 动态导入客户端Header组件 - 仅使用ClientHeader
const ClientHeader = lazy(() => import('./components/ClientHeader'));
// 导入底部导航栏组件
import BottomNavigation from './components/BottomNavigation';

interface AccountRentalLayoutProps {
  children: React.ReactNode;
}

const AccountRentalLayout = memo(({ children }: AccountRentalLayoutProps) => {
  const pathname = usePathname();

  // 总是在顶层调用useTokenChecker钩子，确保Hooks调用顺序一致
  useTokenChecker();

  // 判断是否为登录页面或认证相关页面
  const isAuthPage = !pathname || 
                   pathname === '/publisher/auth/login' || 
                   pathname === '/publisher/auth/register' || 
                   pathname === '/publisher/auth/resetpwd';

  // 对于认证页面，直接渲染内容，不包含导航栏和头部
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // 对于非认证页面，继续执行后续逻辑

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部区域 - 使用动态导入的客户端Header组件，避免hydration错误 */}
      <Suspense fallback={<div style={{ height: '60px' }} />}>
        <ClientHeader user={null} />
      </Suspense>

      {/* 主内容区域 - 添加底部间距，避免被固定的底部导航栏遮挡 */}
      <main className="flex-1 px-2 py-4 overflow-y-auto mt-14 mb-5">
        {children}
      </main>

      {/* 底部导航栏 */}
      <BottomNavigation />
    </div>
  );
});

export default AccountRentalLayout;