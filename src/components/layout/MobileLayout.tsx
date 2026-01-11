'use client';

import { ReactNode } from 'react';
import { EarningsHeader } from '@/components/layout/EarningsHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { MobileLayoutProps } from '@/types';
import { useUser } from '@/hooks/useUser';
import { usePathname } from 'next/navigation';
import { Loading } from '@/components/ui';

export const MobileLayout = ({ 
  children, 
  showEarnings = false,
  navigationItems = [],
  showHeader = true, 
  showNavigation = true,
  title
}: MobileLayoutProps) => {
  const { user, isLoading } = useUser();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-page">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">请先登录</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page">
      {/* 顶部收益栏 */}
      {showHeader && showEarnings && (
        <EarningsHeader />
      )}

      {/* 其他角色的简单顶部栏 */}
      {showHeader && !showEarnings && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">{title || '抖音派单系统'}</h1>
          <div className="flex items-center space-x-3">
            {user && (
              <span className="text-sm text-gray-600">余额: ¥{user.balance.toFixed(2)}</span>
            )}
          </div>
        </header>
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* 底部导航 */}
      {showNavigation && navigationItems.length > 0 && (
        <BottomNavigation items={navigationItems} />
      )}
    </div>
  );
};