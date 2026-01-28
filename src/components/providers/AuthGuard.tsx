'use client';

// 导入ReactNode类型
import { ReactNode } from 'react';

// 定义AuthGuard组件的属性类型
interface AuthGuardProps {
  children: ReactNode;
}

// 导出AuthGuard组件，直接返回子组件，不做任何路由守卫
export const AuthGuard = ({ children }: AuthGuardProps) => {
  // 直接返回子组件，不做任何路由守卫
  return <>{children}</>;
};

// 导出角色守卫HOC（高阶组件），直接返回原组件
export const withRoleGuard = (Component: React.ComponentType) => {
  return function ProtectedComponent(props: any) {
    // 直接返回原组件，不做任何包装
    return <Component {...props} />;
  };
};

// 导出多角色守卫HOC，直接返回原组件
export const withMultiRoleGuard = (Component: React.ComponentType) => {
  return function ProtectedComponent(props: any) {
    // 直接返回原组件，不做任何包装
    return <Component {...props} />;
  };
};