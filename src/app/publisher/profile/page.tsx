'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShopOutlined, WalletOutlined, EditOutlined, OrderedListOutlined, BarChartOutlined, CreditCardOutlined, RightOutlined, BellOutlined, MessageOutlined, UserAddOutlined, DownloadOutlined } from '@ant-design/icons';
import { message } from 'antd';

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
// 定义用户信息接口
interface UserProfile {
  id?: string;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  organization_name: string;
  organization_leader: string;
  userType: string;
  [key: string]: any;
}

// API响应接口
  interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
export default function PublisherProfilePage() {
  const router = useRouter();
  const [balance, setBalance] = useState<BalanceData>({ balance: 0 });
  // 用户个人信息状态
  const [userProfile, setUserProfile] = useState<UserProfile>({
      avatar: '/images/0e92a4599d02a7.jpg',
      name: '', 
      phone: '',
      email: '',
      organization_name: '',
      organization_leader: '',
      userType: ''
  });
  // 加载状态和错误信息
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch('/api/users/getuserinfo', {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
              // Cookie中的token会自动传递
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json() as ApiResponse;
          // 处理后端返回的数据结构
          if (result.code === 200 && result.data && result.data.userInfo) {
            // 从userInfo对象中提取数据
            const apiUserData = result.data.userInfo;
            
            // 映射数据到UserProfile格式
            const mappedUserProfile: UserProfile = {
              id: apiUserData.id,
              avatar: apiUserData.avatar || '/images/0e92a4599d02a7.jpg',
              name: apiUserData.username || '用户',
              phone: apiUserData.phone || '',
              email: apiUserData.email || '',
              organization_name: apiUserData.organization_name || '',
              organization_leader: apiUserData.organization_leader || '',
              userType: apiUserData.userType || '未设置'
            };
            
            setUserProfile(mappedUserProfile);
          } else {
            setError(result.message || '获取用户信息失败');
            console.warn('API响应数据不符合预期:', result);
            // 设置默认数据以便展示
            setUserProfile(prev => ({
              ...prev,
              name: '用户',
              accountType: '未设置'
            }));
          }
        } catch (err) {
          console.error('获取用户信息错误:', err);
          setError('网络请求失败，请稍后重试');
          // 设置默认数据以便展示
          setUserProfile(prev => ({
            ...prev,
            name: '用户',
            accountType: '未设置'
          }));
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserInfo();
    }, []);



  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

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
              <img src={userProfile.avatar} alt="" className="w-full h-full overflow-hidden rounded-lg" />
            </div>
            <div>
              <span className="flex font-bold text-lg items-center">
                {userProfile.organization_name}
              </span>
              <span className="flex text-sm opacity-80">{userProfile.phone}</span>
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