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

  // 检查token有效性
  const checkTokenValidity = async () => {
    // 如果是认证页面，不进行检查
    if (isAuthPage) {
      return;
    }

    setIsChecking(true);
    
    try {
      // 直接调用API检查token有效性
      // API会自动从cookie中获取token，不需要手动传递
      const response = await fetch('/api/auth/checkToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // 确保携带cookie
      });

      // 检查响应状态
      if (!response.ok) {
        redirectToLogin();
        return;
      }
      
     
    } catch (error) {
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
      return;
    }
    
    // 清除浏览器的token和用户信息
    try {
      // 清除localStorage中的数据
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('publisher-user-storage');
      
      // 清除cookie中的token
      document.cookie = 'PublishTask_token=; path=/; max-age=0; SameSite=Lax';
      
      console.log('Token失效，已清除浏览器中的token和用户信息');
    } catch (error) {
      console.error('清除本地存储失败:', error);
    }
    
    // 重定向到登录页面
    setLastRedirectTime(currentTime);
    router.push(`/publisher/auth/login`);
  };

  useEffect(() => {
    // 如果是认证页面，不进行检查
    if (isAuthPage) {
      return;
    }

    // 立即检查token有效性
    checkTokenValidity();

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
      clearInterval(tokenCheckInterval);
    };
  }, [pathname, router, isAuthPage]);

  return { isChecking };
};

export default useTokenChecker;