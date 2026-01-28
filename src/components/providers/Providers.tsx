'use client';

// 导入React的ReactNode类型、useEffect钩子
import { ReactNode, useEffect } from 'react';
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
  // 简化处理：不再需要自动获取用户信息
  // 用户信息由登录成功后直接保存到内存
  useEffect(() => {
    console.log('Providers: 应用加载，用户信息由登录时管理');
  }, []);

  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}