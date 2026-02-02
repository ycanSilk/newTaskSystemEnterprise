'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// 检查token有效性的钩子
export const useTokenChecker = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [lastRedirectTime, setLastRedirectTime] = useState(0);
  const redirectCooldown = 3000; // 3秒冷却时间

  // 检查当前页面是否为认证页面（登录或注册）
  // 当pathname为undefined时，默认视为认证页面，不执行检查
  const isAuthPage = !pathname || 
                   pathname === '/publisher/auth/login' || 
                   pathname === '/publisher/auth/register' || 
                   pathname === '/publisher/auth/resetpwd';

  // 从cookie获取token
  const getTokenFromCookie = (): string | null => {
    try {
      // 尝试从常见的token键名中获取token
      const tokenKeys = ['PublishTask_token', 'token', 'access_token', 'auth_token'];
      
      console.log('当前cookie:', document.cookie);
      
      for (const key of tokenKeys) {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1];
        
        if (cookieValue) {
          console.log('找到token:', key, cookieValue.substring(0, 20) + '...');
          return decodeURIComponent(cookieValue);
        }
      }
      console.log('未找到token');
      return null;
    } catch (error) {
      console.error('Error getting token from cookie:', error);
      return null;
    }
  };

  // 检查token有效性
  const checkTokenValidity = async () => {
    // 如果是认证页面，不进行检查
    if (isAuthPage) {
      return;
    }

    setIsChecking(true);
    
    try {
      // 从cookie获取token
      const token = getTokenFromCookie();
      
      // 如果无法获取token，重定向到登录页面
      if (!token) {
        console.log('无法获取token，重定向到登录页面');
        redirectToLogin();
        return;
      }

      // 调用API检查token有效性
      const response = await fetch('/api/auth/checkToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Token': token
        }
      });

      // 检查响应状态
      if (!response.ok) {
        console.log('token无效，重定向到登录页面');
        redirectToLogin();
        return;
      }

      // 解析响应数据
      const data = await response.json();
      if (!data.success) {
        console.log('Token validation failed, redirecting to login');
        redirectToLogin();
        return;
      }

      console.log('token有效');
    } catch (error) {
      console.error('Error checking token validity:', error);
      // 出错时也重定向到登录页面
      redirectToLogin();
    } finally {
      setIsChecking(false);
    }
  };

  // 重定向到登录页面
  const redirectToLogin = () => {
    // 检查是否在冷却时间内
    const currentTime = Date.now();
    if (currentTime - lastRedirectTime < redirectCooldown) {
      console.log('重定向冷却中，跳过本次重定向');
      return;
    }
    
    // 保留当前页面路径，以便登录后返回
    const returnUrl = pathname ? encodeURIComponent(pathname) : '';
    // 重定向到登录页面
    console.log('执行重定向到登录页面');
    setLastRedirectTime(currentTime);
    router.push(`/publisher/auth/login?returnUrl=${returnUrl}`);
  };

  useEffect(() => {
    // 如果是认证页面，不进行检查
    if (isAuthPage) {
      return;
    }

    // 设置10分钟的间隔检查cookie
    const cookieCheckInterval = setInterval(() => {
      // 再次检查是否在认证页面，避免在页面跳转后仍然执行检查
      if (isAuthPage) {
        return;
      }
      const token = getTokenFromCookie();
      if (!token) {
        console.log('No token found in cookie, redirecting to login');
        redirectToLogin();
      }
    }, 10 * 60 * 1000); // 10分钟

    // 设置60分钟的间隔检查token有效性
    const tokenCheckInterval = setInterval(() => {
      // 再次检查是否在认证页面，避免在页面跳转后仍然执行检查
      if (isAuthPage) {
        return;
      }
      checkTokenValidity();
    }, 60 * 60 * 1000); // 60分钟

    // 组件卸载时清除定时器
    return () => {
      clearInterval(cookieCheckInterval);
      clearInterval(tokenCheckInterval);
    };
  }, [pathname, router, isAuthPage]);

  return { isChecking };
};

export default useTokenChecker;