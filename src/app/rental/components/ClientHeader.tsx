'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import SearchBar from '../../../components/button/SearchBar';
import { BellOutlined } from '@ant-design/icons';
// 导入useUserStore状态管理
import { useUserStore } from '@/store/userStore';
// 导入路由加密解密工具
import { decryptRoute, isEncryptedRoute } from '@/lib/routeEncryption';



interface TopNavigationBarProps {
  user: any | null;
}

export default function TopNavigationBar({ user }: TopNavigationBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 使用useUserStore获取用户信息，包括unread_count
  const { currentUser, unread_count } = useUserStore();
  const userWithUnreadCount = currentUser;

  // 获取实际路径（处理加密路由）
  const getActualPath = () => {
    const pathParts = pathname.split('/').filter(Boolean);
    
    // 检查是否为加密路由
    if (pathParts.length > 0 && isEncryptedRoute(pathParts[0])) {
      try {
        const decryptedPath = decryptRoute(pathParts[0]);
        const decryptedParts = decryptedPath.split('/').filter(Boolean);
        const remainingPath = pathParts.slice(1).join('/');
        return `/${decryptedParts.join('/')}${remainingPath ? `/${remainingPath}` : ''}`;
      } catch (error) {
        // 解密失败，返回原始路径
        return pathname;
      }
    }
    return pathname;
  };

  // 获取当前实际路径
  const actualPath = getActualPath();
  
  // 点击外部关闭下拉菜单 - 确保只有一个事件监听器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    // 监听全局点击事件
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 清理事件监听器
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 定义路由表，映射路径到标题
  const routeTitleMap: Record<string, string> = {
    '/rental/rental_market': '租赁市场',
    '/rental/requests_market': '求租市场',
    '/rental/rental_publish': '发布租赁信息',
    '/rental/rental_publish/requests':'发布求租信息',
    '/rental/rental_publish/rental':'发布出租信息',
    '/rental/my/mysellerrentalorder':'我出售的租赁订单',
    '/rental/my/mybuysrentedorder':'我购买的租赁订单',
    '/rental/my/myrelearentalinfo':'我发布的出租信息',
    '/rental/my/myrelearrequestrentalinfo':'我发布的求租信息',
    '/rental/my/myapplication':'我应征的求租信息',
    '/rental/my/reviewapplication':'待审核的应征信息',
    '/rental/workorder':'工单列表',
    '/rental/workorder/detail/[id]':'工单详情',
    'rental/my':"个人中心"
    // 可以根据需要添加更多路由
  };

  // 需要特殊处理返回的路由列表
  const specialBackRoutes = [
    '/rental/rental_market',
    '/rental/rental_publish',
    '/rental/my',
    '/rental/requests_market'
  ];

  // 获取当前路径的标题 - 只使用精确匹配，不维护动态路由
  const getCurrentTitle = () => {
    // 只使用精确匹配，不处理动态路由
    return routeTitleMap[actualPath] || '账号租赁';
  };

  // 处理返回按钮点击事件
  const handleBack = () => {
    // 获取当前路径的层级
    const pathSegments = actualPath.split('/').filter(Boolean).length;
    
    // 检查是否为特殊路由，点击返回跳转到评论大厅
    if (specialBackRoutes.includes(actualPath)) {
      console.log('当前路由',actualPath);
      router.push('/commenter/hall');
    } 
    // 路径层级大于2级时，调用router.back()处理正常返回
    else if (pathSegments > 2) {
      router.back();
    } 
    // 其他情况也调用router.back()
    else {
      router.back();
    }
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    return actualPath !== '/commenter/hall';
  };

  const handleLogout = async () => {
    try {
      // 调用退出登录API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // 包含Cookie信息
      });
      if(response.ok){console.log('退出登录成功')}
      // 解析响应数据
      const data = await response.json();

      const clearAllAuth = () => {
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.removeItem('commenter_user_info');
            localStorage.removeItem('commenter_active_session');
            localStorage.removeItem('commenter_active_session_last_activity');
          } catch (error) {
            console.error('清除认证信息失败:', error);
          }
        }
      };
      
      // 无论成功还是失败，都清除本地认证状态并跳转登录页
      // 在实际应用中，可以根据响应状态提供不同的用户反馈
      if (data.success) {
        console.log('退出登录成功', data);
        clearAllAuth();
      } else {
        console.warn('退出登录时遇到问题', data);
        // 即使API返回错误，也继续执行本地登出逻辑
      }

      
    } catch (error) {
      console.error('退出登录请求失败', error);
      // 即使请求失败，也执行本地登出逻辑
    } finally {
      // 清除本地状态并跳转到登录页面
      router.push('/commenter/auth/login');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
      {shouldShowBackButton() && (
          <button 
            onClick={handleBack} 
            className="text-white p-1 hover:bg-blue-600 rounded-full"
            aria-label="返回"
          >
            <span className="sr-only">返回</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center space-x-1">
          {isClient && <span className="text-xl font-medium">{getCurrentTitle()}</span>}
        </div>
      </div>
      <div className="flex items-center space-x-3" ref={dropdownRef}>
        <CustomerServiceButton 
          buttonText="联系客服" 
          modalTitle="在线客服"
          CustomerServiceId="admin"
          className="text-white"
        />
      
        <div className="mr-2 relative">
          {/* 通知图标按钮，点击跳转到通知页面 */}
          <button
            onClick={() => router.push('/commenter/notification')}
            className="cursor-pointer hover:bg-blue-600 rounded-full p-1 transition-colors"
            aria-label="通知"
          >
            <BellOutlined className="text-3xl text-white" />
          </button>
          {/* 通知数量提示，只有当unread_count大于0时显示 */}
          {userWithUnreadCount && userWithUnreadCount.unread_count > 0 && (
            <div className="absolute top-0 left-5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {userWithUnreadCount.unread_count}
            </div>
          )}
        </div>

        {/* 用户头像和下拉菜单 */}
        <div className="relative ml-3">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            aria-label="用户菜单"
          >
            <img 
              src={user?.avatar || '/images/default.png'} 
              alt="用户头像" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-[100px] bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10 transform transition-all duration-200 origin-top-right animate-fade-in-down">
              {/* 个人中心按钮 */}
              <button 
                onClick={() => {
                  router.push('/commenter/profile/userinfo');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 border-b border-gray-100 text-gray-800 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                个人信息
              </button>
              
              {/* 退出登录按钮 */}
              <button 
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-sm"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}