'use client';

// 导入React钩子：useState用于状态管理，useEffect用于处理副作用
import { useState, useEffect } from 'react';
// 导入User类型定义
import { User } from '@/types';
// 导入userStore和登录成功后保存用户信息的辅助函数
import { useUserStore, saveUserOnLoginSuccess } from '@/store/userStore';

// 定义useUser钩子返回值的类型
interface UseUserReturn {
  user: User | null; // 用户信息，未登录时为null
  isLoading: boolean; // 是否正在加载用户信息
  isLoggedIn: boolean; // 用户是否已登录
  isAuthenticated: boolean; // 用户是否已认证（等同于isLoggedIn && !!user）
  clearUser: () => void; // 清除用户信息函数
  saveUserOnLogin: (userData: any) => void; // 登录成功后保存用户信息
}

// 导出useUser钩子，用于管理用户登录状态
export function useUser(): UseUserReturn {
  // 从userStore获取状态和方法
  const { currentUser, setUser, clearUser, isLoginSuccess } = useUserStore();
  // 定义加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 定义登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);

  // 初始化时同步状态
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  // 登录成功后保存用户信息
  const saveUserOnLogin = (userData: any) => {
    console.log('登录成功后保存用户信息:', userData);
    saveUserOnLoginSuccess(userData);
    setIsLoggedIn(true);
  };

  // 返回useUser钩子的结果
  return {
    user: currentUser,
    isLoading,
    isLoggedIn,
    isAuthenticated: !!currentUser,
    clearUser,
    saveUserOnLogin
  };
}

// 导出登录成功后保存用户信息的函数，方便在登录页面直接使用
export { saveUserOnLoginSuccess };
