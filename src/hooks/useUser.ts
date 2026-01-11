'use client';

// 导入React钩子：useState用于状态管理，useEffect用于处理副作用
import { useState, useEffect } from 'react';
// 导入User类型定义
import { User } from '@/types';

// 从API获取用户信息的函数
const fetchUserInfoFromApi = async (): Promise<User | null> => {
  try {
    // 调用验证用户登录状态的API端点
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // 包含cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // 解析API响应
    const data = await response.json();
    console.log('GET /api/auth/me 响应数据:', data);
    console.log('登录用户保存的token', data?.data?.token);
    // 如果API返回成功，返回用户信息
    if (data.success && data.data) {
      return data.data;
    }
    
    // 如果API返回失败，返回null
    return null;
  } catch (error) {
    return null;
  }
};

// 直接从API获取用户登录状态，不再依赖document.cookie读取token
const getCurrentLoggedInUser = async (): Promise<User | null> => {
  try {
    // 如果在服务器端渲染，返回null
    if (typeof window === 'undefined') {
      return null;
    }
    
    // 从API获取用户信息
    const user = await fetchUserInfoFromApi();
    
    return user;
  } catch (error) {
    return null;
  }
};

// 检查是否有任何用户登录
const isAnyUserLoggedIn = async (): Promise<boolean> => {
  try {
    // 如果在服务器端渲染，返回false
    if (typeof window === 'undefined') {
      return false;
    }
    
    // 从API获取用户信息
    const user = await fetchUserInfoFromApi();
    
    // 如果有用户信息，说明用户已登录
    return !!user;
  } catch (error) {
    return false;
  }
};

// 定义useUser钩子返回值的类型
interface UseUserReturn {
  user: User | null; // 用户信息，未登录时为null
  isLoading: boolean; // 是否正在加载用户信息
  isLoggedIn: boolean; // 用户是否已登录
  refreshUser: () => void; // 刷新用户信息函数
  isAuthenticated: boolean; // 用户是否已认证（等同于isLoggedIn && !!user）
}

// 导出useUser钩子，用于管理用户登录状态
export function useUser(): UseUserReturn {
  // 定义用户信息状态
  const [user, setUser] = useState<User | null>(null);
  // 定义加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 定义登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查用户登录状态的函数
  const checkLoginStatus = async () => {
    console.log('useUser checkLoginStatus: 开始检查登录状态');
    // 设置加载状态为true
    setIsLoading(true);

    try {
      // 获取当前登录用户，只需调用一次API
      const currentUser = await getCurrentLoggedInUser();
      console.log('useUser checkLoginStatus: 获取到的用户信息 -', currentUser);
      
      // 根据currentUser判断用户是否已登录，避免重复API调用
      const loggedIn = !!currentUser;
      console.log('useUser checkLoginStatus: 登录状态 -', loggedIn);
      // 更新用户信息状态
      setUser(currentUser);
      
      // 更新登录状态
      setIsLoggedIn(loggedIn);
      console.log('useUser checkLoginStatus: 登录状态更新完成');
    } catch (error) {
      console.error('useUser checkLoginStatus: 检查登录状态出错 -', error);
      // 发生错误时，将用户信息和登录状态重置为默认值
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      // 设置加载状态为false
      setIsLoading(false);
      console.log('useUser checkLoginStatus: 检查登录状态完成，isLoading设置为false');
    }
  };

  // 初始化时检查用户登录状态
  useEffect(() => {
    // 异步函数包装器，用于在useEffect中调用异步函数
    const initialize = async () => {
      await checkLoginStatus();
    };
    
    // 调用初始化函数
    initialize();
    
    // 创建cookie变化监听器
    const handleCookieChange = async () => {
      await checkLoginStatus();
    };
    
    // 监听visibilitychange事件，当页面重新可见时检查cookie状态
    document.addEventListener('visibilitychange', handleCookieChange);
    
    // 监听storage事件，当cookie变化时检查登录状态
    window.addEventListener('storage', handleCookieChange);
    
    return () => {
      // 清除事件监听器
      document.removeEventListener('visibilitychange', handleCookieChange);
      window.removeEventListener('storage', handleCookieChange);
    };
  }, []);

  // 刷新用户信息函数
  const refreshUser = async () => {
    await checkLoginStatus();
  };

  // 返回useUser钩子的结果
  return {
    user,
    isLoading,
    isLoggedIn,
    refreshUser,
    isAuthenticated: isLoggedIn && !!user
  };
}