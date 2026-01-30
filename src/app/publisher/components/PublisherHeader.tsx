'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import { BellOutlined } from '@ant-design/icons';
import { useUserStore } from '@/store/userStore';

interface PublisherHeaderProps {
  user?: {
    id: string;
    username?: string;
    name?: string;
    role: string;
    balance: number;
    status?: string;
    createdAt?: string;
    avatar?: string;
  };
}

export const PublisherHeader: React.FC<PublisherHeaderProps> = ({ user = null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 使用useUserStore获取用户信息和方法
  const { currentUser, clearUser } = useUserStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 定义路由标题映射表
  const routeTitleMap: Record<string, string> = {
    '/publisher/dashboard': '评论订单',
    '/publisher/create': '发布任务',
    '/publisher/profile': '我的',
    '/publisher/orders': '订单管理',
    '/publisher/balance': '余额',
    '/publisher/recharge': '充值',
    '/publisher/bank-cards': '银行卡管理',
    '/publisher/notification': '通知提醒',
    '/publisher/stats': '统计报表',
    '/publisher/allsuborders': '所有子订单',
  };

  // 获取当前路径的标题
  const getCurrentTitle = () => {
    if (!pathname) return '发布者中心';
    
    // 移除查询参数
    const pathWithoutQuery = pathname.split('?')[0];
    
    // 精确匹配
    if (routeTitleMap[pathWithoutQuery]) {
      return routeTitleMap[pathWithoutQuery];
    }
    
    // 前缀匹配
    for (const [route, title] of Object.entries(routeTitleMap)) {
      if (pathWithoutQuery.startsWith(route + '/')) {
        return title;
      }
    }
    
    return '发布者中心';
  };

  // 处理返回按钮点击事件
  const handleBack = () => {
    router.back();
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    if (!pathname) return false;
    
    // 移除查询参数
    const pathWithoutQuery = pathname.split('?')[0];
    
    // 一级路由不显示返回按钮
    const noBackButtonRoutes = [
      '/publisher/dashboard',
      '/publisher/create',
      '/publisher/profile'
    ];
    
    return !noBackButtonRoutes.includes(pathWithoutQuery);
  };

  // 处理退出登录
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
      
      // 解析响应数据
      const data = await response.json();

      // 清除所有认证信息
      const clearAllAuth = () => {
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.removeItem('publisher_user_info');
            localStorage.removeItem('publisher_active_session');
            localStorage.removeItem('publisher_active_session_last_activity');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch (error) {
            console.error('清除认证信息失败:', error);
          }
        }
        
        // 清除用户状态
        clearUser();
      };
      
      // 无论成功还是失败，都清除本地认证状态并跳转登录页
      if (data.success) {
        console.log('退出登录成功', data);
        clearAllAuth();
      } else {
        console.warn('退出登录时遇到问题', data);
        // 即使API返回错误，也继续执行本地登出逻辑
        clearAllAuth();
      }

    } catch (error) {
      console.error('退出登录请求失败', error);
      // 即使请求失败，也执行本地登出逻辑
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('publisher_user_info');
          localStorage.removeItem('publisher_active_session');
          localStorage.removeItem('publisher_active_session_last_activity');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (error) {
          console.error('清除认证信息失败:', error);
        }
      }
      clearUser();
    } finally {
      // 跳转到登录页面
      router.push('/publisher/auth/login');
    }
  };

  return (
    <div className="bg-blue-500 border-b border-[#9bcfffff] px-4 py-3 flex items-center justify-between h-[60px] box-border">
      <div className="flex items-center flex-1">
        {isClient && shouldShowBackButton() && (
          <button 
            onClick={handleBack}
            className="p-2 rounded-full transition-colors text-white"
            aria-label="返回上一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl text-white ml-1">
          {isClient && getCurrentTitle()}
        </h1>
      </div>
      <div className="flex items-center relative" ref={dropdownRef}>
        {isClient && (
          <CustomerServiceButton 
            buttonText="联系客服" 
            modalTitle="在线客服" 
            CustomerServiceId={'admin'} 
            className="text-white font-bold mr-2 flex items-center gap-1 px-3 py-1 rounded"
          />
        )}
        
        <div className="mr-2 relative">
          {/* 通知图标按钮，点击跳转到通知页面 */}
          <button
            onClick={() => router.push('/publisher/notification')}
            className="cursor-pointer hover:bg-blue-600 rounded-full p-1 transition-colors"
            aria-label="通知"
          >
            <BellOutlined className="text-3xl text-white" />
          </button>
          {/* 通知数量提示 */}
          <div className="absolute top-0 left-5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>

        {/* 用户头像和下拉菜单 */}
        <div className="relative ml-3">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            aria-label="用户菜单"
          >
            <img 
              src={user?.avatar || currentUser?.avatar || '/images/default.png'} 
              alt="用户头像" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10 transform transition-all duration-200 origin-top-right animate-fade-in-down">
              {/* 个人中心按钮 */}
              <button 
                onClick={() => {
                  router.push('/publisher/profile/settings');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 border-b border-gray-100 text-gray-800 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                个人中心
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
};