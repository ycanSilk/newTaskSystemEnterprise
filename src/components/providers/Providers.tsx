'use client';

// 导入React的ReactNode类型、useEffect钩子和useMemo钩子
import { ReactNode, useEffect, useMemo } from 'react';
// 导入React Query相关组件
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 导入Toast相关组件，用于提供全局消息提示功能
import { ToastProvider, Toaster } from '@/components/ui/Toast';
// 导入Zustand用户状态存储
import { useUserStore } from '@/store/userStore';

// 定义Providers组件的属性类型
interface ProvidersProps {
  children: ReactNode; // 子组件，可以是任何React元素
}

// 导出Providers组件，用于包装整个应用
// 这个组件是应用级别的上下文提供者，提供全局功能
// 目前包含Toast消息提示功能和用户信息状态管理
// 后续可以添加更多全局功能，如主题管理、国际化等
export function Providers({ children }: ProvidersProps) {
  // 从Zustand store获取fetchUser方法
  const fetchUser = useUserStore(state => state.fetchUser);

  // 在组件内部创建QueryClient实例，使用useMemo确保只创建一次
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5分钟的缓存时间
          gcTime: 10 * 60 * 1000, // 10分钟后垃圾回收
          retry: 1, // 失败时重试1次
          refetchOnWindowFocus: false, // 窗口聚焦时不重新请求
          refetchOnReconnect: 'always', // 网络重新连接时重新请求
          refetchOnMount: true, // 组件挂载时重新请求
        },
        mutations: {
          retry: 1, // 失败时重试1次
        },
      },
    });
  }, []);

  // 应用加载时调用fetchUser方法获取用户信息，但登录页面除外
  useEffect(() => {
    // 检查当前页面是否为登录页面，如果是则不调用API
    if (typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname.includes('/auth/login');
      if (!isLoginPage) {
        console.log('Providers: 初始化获取用户信息');
        fetchUser();
      }
    }
  }, [fetchUser]);

  return (
    // QueryClientProvider是React Query的上下文提供者
    <QueryClientProvider client={queryClient}>
      {/* ToastProvider是Toast功能的上下文提供者 */}
      <ToastProvider>
        {/* 渲染子组件，即整个应用的内容 */}
        {children}
        {/* Toaster组件用于显示Toast消息 */}
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
}