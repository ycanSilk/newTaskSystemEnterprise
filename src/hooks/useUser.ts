'use client';

// 导入React钩子：useState用于状态管理，useEffect用于处理副作用
import { useState, useEffect, useRef } from 'react';
// 导入User类型定义
import { User } from '@/types';
// 导入userStore
import { useUserStore } from '@/store/userStore';

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
      cache: 'no-store',
    });
    
    // 如果响应状态为401，直接返回null，不解析响应体
    if (response.status === 401) {
      return null;
    }
    
    // 解析API响应
    const data = await response.json();
    console.log('GET /api/auth/me 响应数据:', data);
    
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

// 获取当前登录用户
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
    console.error('Failed to get current logged in user:', error);
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
    return !!user;
  } catch (error) {
    console.error('Failed to check if any user is logged in:', error);
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
  // 从userStore获取状态和方法
  const { currentUser, setUser, clearUser, fetchUser } = useUserStore();
  // 定义加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 定义登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);
  // 请求防抖定时器引用
  const requestDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // 上次请求时间引用
  const lastRequestTimeRef = useRef<number>(0);

  // 检查用户登录状态的函数
  const checkLoginStatus = async () => {
    // 防抖：如果在短时间内已经请求过，跳过
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 1000) {
      return;
    }
    
    console.log('useUser checkLoginStatus: 开始检查登录状态');
    // 设置加载状态为true
    setIsLoading(true);
    lastRequestTimeRef.current = now;

    try {
      // 获取当前登录用户
      const user = await getCurrentLoggedInUser();
      console.log('useUser checkLoginStatus: 获取到的用户信息 -', user);
      
      // 根据user判断用户是否已登录
      const loggedIn = !!user;
      console.log('useUser checkLoginStatus: 登录状态 -', loggedIn);
      console.log('设置用户信息到store:', user);
      // 更新userStore中的用户信息
      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
      
      // 更新本地状态
      setIsLoggedIn(loggedIn);
      console.log('useUser checkLoginStatus: 登录状态更新完成');
    } catch (error) {
      console.error('useUser checkLoginStatus: 检查登录状态出错 -', error);
      // 发生错误时，将用户信息和登录状态重置为默认值
      clearUser();
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
      // 调用API检查登录状态
      await checkLoginStatus();
    };
    
    // 调用初始化函数
    initialize();
    
    // 创建事件处理函数，添加防抖
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 防抖：300ms内只执行一次
        if (requestDebounceRef.current) {
          clearTimeout(requestDebounceRef.current);
        }
        requestDebounceRef.current = setTimeout(() => {
          checkLoginStatus();
        }, 300);
      }
    };
    
    // 监听visibilitychange事件，当页面重新可见时检查登录状态
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // 清除事件监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // 清除防抖定时器
      if (requestDebounceRef.current) {
        clearTimeout(requestDebounceRef.current);
      }
    };
  }, [setUser, clearUser]);

  // 刷新用户信息函数
  const refreshUser = async () => {
    await checkLoginStatus();
  };

  // 返回useUser钩子的结果
  return {
    user: currentUser,
    isLoading,
    isLoggedIn,
    refreshUser,
    isAuthenticated: isLoggedIn && !!currentUser
  };
}