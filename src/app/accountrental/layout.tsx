'use client';
import React, { memo, useState, useEffect, lazy, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ShopOutlined from '@ant-design/icons/ShopOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { User } from '@/types';

// 动态导入客户端Header组件 - 仅使用ClientHeader
const ClientHeader = lazy(() => import('./components/ClientHeader'));

interface AccountRentalLayoutProps {
  children: React.ReactNode;
}

const AccountRentalLayout = memo(({ children }: AccountRentalLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);



  const handleMarketClick = () => {
    router.push('/accountrental/account-rental-market');
  };

  const handlePublishClick = () => {
    router.push('/accountrental/account-rental-publish');
  };

  const handleMyClick = () => {
    router.push('/accountrental/my-account-rental');
  };

  // 跳转到求租信息页面
  const handleRequestsClick = () => {
    router.push('/accountrental/account-rental-requests');
  };

  // 确定当前激活的导航项
  const isMarketActive = pathname?.includes('account-rental-market') ?? false;
  const isRequestsActive = pathname?.includes('account-rental-requests') ?? false;
  const isPublishActive = pathname?.includes('account-rental-publish') ?? false;
  const isMyActive = pathname?.includes('my-account-rental') ?? false;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部区域 - 使用动态导入的客户端Header组件，避免hydration错误 */}
      <Suspense fallback={<div style={{ height: '60px' }} />}>
        <ClientHeader user={user} />
      </Suspense>

      {/* 主内容区域 */}
      <main className="flex-1 px-2 py-4 overflow-y-auto">
        {children}
      </main>

      {/* 底部导航栏 */}
      <footer className="h-[56px] bg-white flex justify-around items-center border-t border-gray-300 py-3">
        <button 
          onClick={handleMarketClick}
          className="flex flex-col items-center"
        >
          <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full  ${isMarketActive ? ' text-blue-500' : 'text-gray-500'}`}>
            <ShopOutlined />
          </span>
          <span className={`text-xs ${isMarketActive ? 'text-blue-500' : 'text-gray-500'}`}>出租市场</span>
        </button>
        <button 
          onClick={handleRequestsClick}
          className="flex flex-col items-center"
        >
          <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full  ${isRequestsActive ? ' text-blue-500' : 'text-gray-500'}`}>
            <SearchOutlined />
          </span>
          <span className={`text-xs ${isRequestsActive ? 'text-blue-500' : 'text-gray-500'}`}>求租市场</span>
        </button>
        <button 
          onClick={handlePublishClick}
          className="flex flex-col items-center"
        >
          <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full  ${isPublishActive ? ' text-blue-500' : 'text-gray-500'}`}>
            <FileTextOutlined />
          </span>
          <span className={`text-xs ${isPublishActive ? 'text-blue-500' : 'text-gray-500'}`}>发布租赁</span>
        </button>
        <button 
          onClick={handleMyClick}
          className="flex flex-col items-center"
        >
          <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full  ${isMyActive ? ' text-blue-500' : 'text-gray-500'}`}>
            <UserOutlined />
          </span>
          <span className={`text-xs ${isMyActive ? 'text-blue-500' : 'text-gray-500'}`}>我的租赁</span>
        </button>
      </footer>
    </div>
  );
});

export default AccountRentalLayout;