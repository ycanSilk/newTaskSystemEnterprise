'use client';

// 导入React的ReactNode类型，用于定义子组件类型
import { ReactNode } from 'react';
// 导入Toast相关组件，用于提供全局消息提示功能
import { ToastProvider, Toaster } from '@/components/ui/Toast';

// 定义Providers组件的属性类型
interface ProvidersProps {
  children: ReactNode; // 子组件，可以是任何React元素
}

// 导出Providers组件，用于包装整个应用
// 这个组件是应用级别的上下文提供者，提供全局功能
// 目前只包含Toast消息提示功能
// 后续可以添加更多全局功能，如主题管理、国际化等
export function Providers({ children }: ProvidersProps) {
  return (
    // ToastProvider是Toast功能的上下文提供者
    <ToastProvider>
      {/* 渲染子组件，即整个应用的内容 */}
      {children}
      {/* Toaster组件用于显示Toast消息 */}
      <Toaster />
    </ToastProvider>
  );
}