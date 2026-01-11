'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/button/ReturnToPreviousPage';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import SearchBar from '@/components/button/SearchBar';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';

import { User } from '@/types';

interface HeaderProps {
  // 可以添加需要的props
  customBackHandler?: () => void;
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ customBackHandler, user }) => {
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push('/publisher/dashboard');
  };

  // 账号租赁相关的搜索模块配置
  const accountRentalModules = [
    {
      keywords: ['账号租赁', '账号', '租赁', '平台账号'],
      urlPath: '/accountrental/account-rental-market',
      moduleName: '账号租赁市场',
    },
    {
      keywords: ['订单', '账号订单'],
      urlPath: '/accountrental/orders',
      moduleName: '账号订单管理',
    },
    {
      keywords: ['我的账号', '账号管理'],
      urlPath: '/accountrental/my-accounts',
      moduleName: '我的账号',
    },
  ];

  return (
    <header className="h-[56px] bg-blue-500 flex items-center px-4 border-b border-gray-200 sticky top-0 z-10">
      {/* 使用公共 BackButton 组件，并传递自定义返回处理函数 */}
      <BackButton className="w-[36px] h-[36px] flex items-center justify-center" customBackHandler={customBackHandler} />

      {/* 使用公共搜索组件 */}
      <div className="flex-1 ml-3 flex justify-end">
        <SearchBar
          className="w-[40px] h-[40px]  rounded-full flex items-center justify-center"
          customModules={accountRentalModules}
        />
      </div>

      <div >
        <CustomerServiceButton className="font-bold text-white text-xl" />
      </div>

      {/* 用户信息显示 */}
      {user && (
        <div className="ml-2 text-white flex items-center">
          <div className="text-sm font-medium mr-2">
            用户{user.id}
          </div>
        </div>
      )}

      {/* 管理后台按钮 - 修改为符号样式 */}
      <button
        onClick={handleDashboardClick}
        className="ml-1 w-[36px] h-[36px] flex items-center justify-center bg-transparent border-none cursor-pointer text-white rounded-full transition-colors relative group"
      >
        {/* 使用@ant-design/icons中的设置图标 */}
          <SettingOutlined className="text-xl" />
        {/* 悬停时显示中文提示 */}
        <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none">
          返回
        </span>
      </button>
    </header>
  );
};

export default Header;