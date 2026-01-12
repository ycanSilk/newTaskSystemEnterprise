'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShopOutlined, WalletOutlined, EditOutlined, OrderedListOutlined, BarChartOutlined, CreditCardOutlined, RightOutlined, BellOutlined, MessageOutlined, UserAddOutlined, DownloadOutlined } from '@ant-design/icons';
import { message } from 'antd';
// 导入Zustand用户状态存储
import { useUserStore } from '@/store/userStore';
// 导入用户信息类型定义


interface BalanceData {
  balance: number;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function PublisherProfilePage() {
  const router = useRouter();
  const [balance, setBalance] = useState<BalanceData>({ balance: 0 });
  // 从Zustand store获取用户信息
  const { currentUser, fetchUser } = useUserStore();
  // 未读通知数量
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // 组件挂载时，确保用户信息已加载
  useEffect(() => {
    if (!currentUser) {
      fetchUser();
    }
  }, [currentUser, fetchUser]);

  // 获取余额数据和未读通知数量
  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setBalance({ balance: 1298 });
    }, 500);
    
    // 从localStorage读取未读通知状态
    const savedUnreadStatus = localStorage.getItem('notificationReadStatus');
    if (savedUnreadStatus) {
      const readStatus = JSON.parse(savedUnreadStatus);
      const unreadCount = Object.values(readStatus).filter(isRead => !isRead).length;
      setUnreadNotificationCount(unreadCount);
    }
    
    // 定期检查未读通知数量
    const interval = setInterval(() => {
      const savedUnreadStatus = localStorage.getItem('notificationReadStatus');
      if (savedUnreadStatus) {
        const readStatus = JSON.parse(savedUnreadStatus);
        const unreadCount = Object.values(readStatus).filter(isRead => !isRead).length;
        setUnreadNotificationCount(unreadCount);
      }
    }, 5000); // 每5秒检查一次
    
    return () => clearInterval(interval);
  }, []);

  // 菜单项列表
  const menuItems: MenuItem[] = [
    {
      id: 'balance',
      title: '账户余额',
      icon: <WalletOutlined className="text-xl" />,
      color: 'bg-yellow-100',
      path: '/publisher/balance'
    },
    {
      id: 'payment-method',
      title: '支付设置',
      icon: <CreditCardOutlined className="text-xl" />,
      color: 'bg-purple-100',
      path: '/publisher/profile/paymentsettings'
    },
    {
      id: 'order-management',
      title: '订单管理',
      icon: <OrderedListOutlined className="text-xl" />,
      color: 'bg-green-100',
      path: '/publisher/orders'
    },
    {
      id: 'data-stats',
      title: '数据总览',
      icon: <BarChartOutlined className="text-xl" />,
      color: 'bg-blue-100',
      path: '/publisher/profile/data-stats'
    },
    {
      id: 'notifications',
      title: '通知提醒',
      icon: <BellOutlined className="text-xl" />,
      color: 'bg-orange-100',
      path: '/publisher/notification'
    },
    {
      id: 'customer-service',
      title: '联系客服',
      icon: <MessageOutlined className="text-xl" />,
      color: 'bg-cyan-100',
      path: '/publisher/customer-service'
    },
    {
      id: 'cooperation-agent',
      title: '合作代理',
      icon: <UserAddOutlined className="text-xl" />,
      color: 'bg-indigo-100',
      path: '#cooperation'
    },
    {
      id: 'douyin-download',
      title: '抖音版本下载',
      icon: <DownloadOutlined className="text-xl" />,
      color: 'bg-pink-100',
      path: '/publisher/douyin-version'
    }
  ];

  // 处理菜单项点击
  const handleMenuItemClick = (path: string) => {
    if (path === '#cooperation') {
      // 显示提示框
      message.info('该功能暂未开放');
      return;
    }
    router.push(path as any);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* 顶部用户信息区域 */}
      <div className="bg-blue-500 text-white p-3 mb-5 mt-5">
        <div 
          className="flex items-center justify-between space-x-4 cursor-pointer  p-2 transition-colors"
          onClick={() => router.push('/publisher/profile/settings')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">
              <img src="/images/0e92a4599d02a7.jpg" alt="" className="w-full h-full overflow-hidden rounded-lg" />
            </div>
            <div>
              <span className="flex font-bold text-lg items-center">
                {currentUser?.organization_name || '测试组织'}
              </span>
              <span className="flex text-sm opacity-80">{currentUser?.phone || '13800138000'}</span>
            </div>
          </div>
          <div className="text-white">
            <RightOutlined className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 功能菜单列表 */}
      <div className="mb-5">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMenuItemClick(item.path)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  // 增大移动端触摸区域
                  minHeight: '60px',
                  touchAction: 'manipulation'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-xl relative`}>
                    {item.icon}
                    {/* 未读通知数量显示 */}
                    {item.id === 'notifications' && unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotificationCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="text-gray-400">
                  <RightOutlined className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部提示区域 */}
      <div>
        <div className="text-center text-gray-500 text-xs">
          <p>商家中心 v1.0.0</p>
          <p className="mt-1">© 2025 版权所有</p>
        </div>
      </div>
    </div>
  );
}