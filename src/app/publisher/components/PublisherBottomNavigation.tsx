'use client';

import React from 'react';
import { BottomNavigation } from '../../../components/layout/BottomNavigation';
import { NavigationItem } from '@/types';
import { 
  FileOutlined, 
  PlusCircleOutlined, 
  TeamOutlined, 
  BarChartOutlined, 
  WalletOutlined, 
  UserOutlined 
} from '@ant-design/icons';

/**
 * 发布者底部导航栏组件
 * 封装了发布者页面的底部导航栏，包含订单、发布、统计、财务和我的五个导航项
 */
export const PublisherBottomNavigation: React.FC = () => {
  // 发布者导航项配置 - 移除账号租赁相关内容
  const publisherNavigationItems: NavigationItem[] = [
    {
      icon: <FileOutlined />,
      label: '评论管理',
      path: '/publisher/dashboard'
    },
    {
      icon: <PlusCircleOutlined />,
      label: '发布评论',
      path: '/publisher/create'
    },
    { icon: <WalletOutlined />, 
      label: '租赁市场', 
      path: '/rental/rental_market' },
    {
      icon: <UserOutlined />,
      label: '我的',
      path: '/publisher/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-51">
      <BottomNavigation items={publisherNavigationItems} />
    </div>
  );
};