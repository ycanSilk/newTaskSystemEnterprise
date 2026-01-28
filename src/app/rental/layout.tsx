'use client';
import React, { memo, lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@/types';

// 动态导入客户端Header组件 - 仅使用ClientHeader
const ClientHeader = lazy(() => import('./components/ClientHeader'));
// 导入底部导航栏组件
import BottomNavigation from './components/BottomNavigation';

interface AccountRentalLayoutProps {
  children: React.ReactNode;
}

const AccountRentalLayout = memo(({ children }: AccountRentalLayoutProps) => {
  const pathname = usePathname();



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