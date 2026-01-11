'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';

// 从localStorage获取当前登录用户信息
const getCurrentLoggedInUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const publisherToken = localStorage.getItem('publisher_auth_token');
    const publisherUser = localStorage.getItem('publisher_user_info');
    if (publisherToken && publisherUser) {
      const userInfo = JSON.parse(publisherUser);
      return {
        id: userInfo.id || '',
        username: userInfo.username || '',
        role: 'publisher',
        ...userInfo,
        balance: userInfo.balance || 0,
        status: userInfo.status || 'active',
        createdAt: userInfo.createTime || new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取当前登录用户信息失败:', error);
    return null;
  }
};

// 检查是否有任何用户登录
const isAnyUserLoggedIn = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    // 检查commenter认证数据
    const commenterAuthData = localStorage.getItem('commenter_auth_data');
    if (commenterAuthData) return true;
    
    // 检查publisher认证数据
    const publisherToken = localStorage.getItem('publisher_auth_token');
    if (publisherToken) return true;
    
    // 检查会话标记
    const activeSession = sessionStorage.getItem('commenter_active_session');
    if (activeSession) return true;
    
    return false;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
};

// 保存用户信息到localStorage
export const saveUserInfo = (user: User): void => {
  try {
    if (typeof window === 'undefined') return;

    if (user.role === 'commenter') {
      // 保存commenter用户信息
      localStorage.setItem('commenter_auth_data', JSON.stringify({
        userId: user.id,
        username: user.username,
        userInfo: user
      }));
    } else if (user.role === 'publisher') {
      // 保存publisher用户信息
      localStorage.setItem('publisher_user_info', JSON.stringify(user));
    }
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
};

// 通用登录函数
const commonLogin = async (credentials: any) => {
  try {
    // 这是一个简化的登录实现，实际项目中应该调用后端API
    const { username, password, role } = credentials;
    
    // 根据不同角色返回模拟数据
    if (role === 'commenter') {
      return {
        success: true,
        message: '登录成功',
        user: {
          id: `commenter-${Date.now()}`,
          username,
          role: 'commenter' as const, // 断言为UserRole类型的字面量
          balance: 0,
          status: 'active' as const, // 断言为User中定义的status类型
          createdAt: new Date().toISOString()
        }
      };
    } else if (role === 'publisher') {
      return {
        success: true,
        message: '登录成功',
        user: {
          id: `publisher-${Date.now()}`,
          username,
          role: 'publisher' as const, // 断言为UserRole类型的字面量
          balance: 1000,
          status: 'active' as const, // 断言为User中定义的status类型
          createdAt: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: '不支持的角色类型'
      };
    }
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '登录过程中发生错误'
    };
  }
};

// 通用登出函数
const commonLogout = async () => {
  try {
    if (typeof window === 'undefined') return;
    
    // 清除所有认证相关数据
    localStorage.removeItem('commenter_auth_data');
    localStorage.removeItem('publisher_auth_token');
    localStorage.removeItem('publisher_user_info');
    sessionStorage.removeItem('commenter_active_session');
    
    console.log('已清除所有认证信息');
  } catch (error) {
    console.error('登出失败:', error);
  }
};

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 初始化时检查用户登录状态
  useEffect(() => {
    setIsLoading(true);

    // 获取当前登录用户
    const currentUser = getCurrentLoggedInUser();
    const loggedIn = isAnyUserLoggedIn();
    
    setUser(currentUser);
    setIsLoggedIn(loggedIn);
    setIsLoading(false);
  }, []);

  // 登录函数
  const handleLogin = async (credentials: any) => {
    setIsLoading(true);
    
    try {
      const result = await commonLogin(credentials);
      
      if (result.success && result.user) {
        // 更新状态
        setUser(result.user);
        setIsLoggedIn(true);
        
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message || '登录失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '登录过程中发生错误，请重试'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const handleLogout = async () => {
    setIsLoading(true);
    setIsLoggedIn(false);
    setUser(null);
    await commonLogout();
    setIsLoading(false);
  };

  // 刷新用户信息
  const refreshUser = () => {
    const currentUser = getCurrentLoggedInUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // 更新用户信息
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    
    // 更新存储的用户信息
    if (typeof window !== 'undefined' && updatedUser.role) {
      if (updatedUser.role === 'commenter') {
        try {
          // 更新评论者用户信息
          localStorage.setItem('commenter_user_info', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('更新评论者用户信息失败:', error);
        }
      } else if (updatedUser.role === 'publisher') {
        try {
          // 更新发布者用户信息
          localStorage.setItem('publisher_user_info', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('更新发布者用户信息失败:', error);
        }
      }
    }
  };

  return {
    user,
    isLoading,
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
    updateUser,
    isAuthenticated: isLoggedIn && !!user
  };
}