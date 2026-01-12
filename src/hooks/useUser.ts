'use client';

// 导入React钩子：useState用于状态管理，useEffect用于处理副作用
import { useState, useEffect, useRef } from 'react';
// 导入User类型定义
import { User } from '@/types';
// 导入加密解密函数
import { encryptData, decryptData } from '@/lib/userEncryption';

// 本地存储键名
const USER_STORAGE_KEY = 'task_system_user_cache';
// 缓存过期时间（5分钟）
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

// 定义缓存用户信息的类型，包含指定字段
interface CachedUser {
  user_id: number;
  username: string;
  email: string;
  phone: string | null;
  organization_name: string;
  organization_leader: string;
  role: string;
  token: string;
  cachedAt: number;
  // 兼容原有代码的字段
  id?: string;
  status?: string;
  createdAt?: string;
  // 添加User类型需要的balance属性
  balance?: number;
}

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
      // 清除本地缓存
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    
    // 解析API响应
    const data = await response.json();
    console.log('GET /api/auth/me 响应数据:', data);
    
    // 如果API返回成功，返回用户信息并更新本地缓存
    if (data.success && data.data) {
      // 只缓存指定字段
      const cachedUser: CachedUser = {
        user_id: data.data.user_id || 0,
        username: data.data.username || '',
        email: data.data.email || '',
        phone: data.data.phone || null,
        organization_name: data.data.organization_name || '',
        organization_leader: data.data.organization_leader || '',
        role: data.data.role || '',
        token: data.data.token || '',
        cachedAt: Date.now(),
        // 添加balance属性，从API响应获取或使用默认值
        balance: data.data.balance || data.data.wallet?.balance || 0,
        // 兼容原有代码的字段
        id: data.data.id,
        status: data.data.status,
        createdAt: data.data.createdAt,
      };
      
      // 使用加密函数存储用户信息
      const encryptedUser = encryptData(cachedUser);
      localStorage.setItem(USER_STORAGE_KEY, encryptedUser);
      return data.data;
    }
    
    // 如果API返回失败，返回null并清除本地缓存
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  } catch (error) {
    return null;
  }
};

// 从本地存储获取用户信息
const getUserFromLocalStorage = (): User | null => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const encryptedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    if (encryptedUserStr) {
      // 使用解密函数获取用户信息
      const cachedUser = decryptData<CachedUser>(encryptedUserStr);
      // 检查缓存是否过期
      const now = Date.now();
      if (now - cachedUser.cachedAt > CACHE_EXPIRY_TIME) {
        // 缓存过期，清除缓存
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
      
      // 返回缓存的用户信息（不包含cachedAt字段）
      const { cachedAt, ...user } = cachedUser;
      return user as User;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from local storage:', error);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

// 检查缓存是否过期
const isCacheExpired = (): boolean => {
  try {
    if (typeof window === 'undefined') {
      return true;
    }
    
    const encryptedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!encryptedUserStr) {
      return true;
    }
    
    // 使用解密函数获取用户信息
    const cachedUser = decryptData<CachedUser>(encryptedUserStr);
    const now = Date.now();
    return now - cachedUser.cachedAt > CACHE_EXPIRY_TIME;
  } catch (error) {
    return true;
  }
};

// 获取当前登录用户，优先使用本地缓存
const getCurrentLoggedInUser = async (): Promise<User | null> => {
  try {
    // 如果在服务器端渲染，返回null
    if (typeof window === 'undefined') {
      return null;
    }
    
    // 检查本地缓存是否存在且未过期
    // getUserFromLocalStorage() 已经检查了缓存是否过期，不需要再次检查
    const cachedUser = getUserFromLocalStorage();
    if (cachedUser) {
      console.log('useUser: 使用本地缓存的用户信息');
      return cachedUser;
    }
    
    // 缓存过期或不存在，从API获取用户信息
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
    
    // 优先检查本地缓存
    // getUserFromLocalStorage() 已经检查了缓存是否过期，不需要再次检查
    const cachedUser = getUserFromLocalStorage();
    if (cachedUser) {
      return true;
    }
    
    // 缓存过期或不存在，从API获取用户信息
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
  // 定义用户信息状态
  const [user, setUser] = useState<User | null>(() => {
    // 初始化时从本地存储获取用户信息
    return getUserFromLocalStorage();
  });
  // 定义加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 定义登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(!!getUserFromLocalStorage());
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
      const currentUser = await getCurrentLoggedInUser();
      console.log('useUser checkLoginStatus: 获取到的用户信息 -', currentUser);
      
      // 根据currentUser判断用户是否已登录
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
      // 清除本地缓存
      localStorage.removeItem(USER_STORAGE_KEY);
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
      // 如果有本地缓存且未过期，直接使用本地缓存，不调用API
      const cachedUser = getUserFromLocalStorage();
      const isExpired = isCacheExpired();
      
      if (cachedUser && !isExpired) {
        setUser(cachedUser);
        setIsLoggedIn(true);
        setIsLoading(false);
        console.log('useUser: 使用本地缓存初始化用户状态');
      } else {
        // 缓存过期或不存在，调用API检查
        await checkLoginStatus();
      }
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
    
    const handleStorageChange = (e: StorageEvent) => {
      // 只有当存储的用户信息发生变化时，才重新检查
      if (e.key === USER_STORAGE_KEY) {
        checkLoginStatus();
      }
    };
    
    // 监听visibilitychange事件，当页面重新可见时检查登录状态
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 监听storage事件，当其他标签页的用户信息变化时检查登录状态
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // 清除事件监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      // 清除防抖定时器
      if (requestDebounceRef.current) {
        clearTimeout(requestDebounceRef.current);
      }
    };
  }, []);

  // 刷新用户信息函数
  const refreshUser = async () => {
    // 清除本地缓存，强制从API获取最新数据
    localStorage.removeItem(USER_STORAGE_KEY);
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