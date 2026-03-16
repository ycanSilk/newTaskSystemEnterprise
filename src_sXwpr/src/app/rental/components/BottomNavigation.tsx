'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShopOutlined, SearchOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // 判断当前活跃状态
  const isMarketActive = pathname.includes('rental_market');
  const isRequestsActive = pathname.includes('requests_market');
  const isPublishActive = pathname.includes('rental_publish');
  const isMyActive = pathname.includes('my');

  // 处理导航点击
  const handleMarketClick = () => {
    router.push('/rental/rental_market');
  };

  const handleRequestsClick = () => {
    router.push('/rental/requests_market');
  };

  const handlePublishClick = () => {
    router.push('/rental/rental_publish');
  };

  const handleMyClick = () => {
    router.push('/rental/my');
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full h-[56px] bg-white flex justify-around items-center border-t border-gray-300 py-3 z-50">
      <button 
        onClick={handleMarketClick}
        className="flex flex-col items-center"
      >
        <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full ${isMarketActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <ShopOutlined />
        </span>
        <span className={`text-xs ${isMarketActive ? 'text-blue-500' : 'text-gray-500'}`}>出租市场</span>
      </button>
      <button 
        onClick={handleRequestsClick}
        className="flex flex-col items-center"
      >
        <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full ${isRequestsActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <SearchOutlined />
        </span>
        <span className={`text-xs ${isRequestsActive ? 'text-blue-500' : 'text-gray-500'}`}>求租市场</span>
      </button>
      <button 
        onClick={handlePublishClick}
        className="flex flex-col items-center"
      >
        <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full ${isPublishActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <FileTextOutlined />
        </span>
        <span className={`text-xs ${isPublishActive ? 'text-blue-500' : 'text-gray-500'}`}>发布租赁</span>
      </button>
      <button 
        onClick={handleMyClick}
        className="flex flex-col items-center"
      >
        <span className={`text-xl w-6 h-6 flex items-center justify-center rounded-full ${isMyActive ? 'text-blue-500' : 'text-gray-500'}`}>
          <UserOutlined />
        </span>
        <span className={`text-xs ${isMyActive ? 'text-blue-500' : 'text-gray-500'}`}>我的租赁</span>
      </button>
    </footer>
  );
};

export default BottomNavigation;