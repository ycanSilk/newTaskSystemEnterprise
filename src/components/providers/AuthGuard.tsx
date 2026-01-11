'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Loading } from '@/components/ui';

// 替代已删除的auth模块的内联实现
const getRoleHomePath = (role: string) => {
  // 根据角色返回对应的首页路径
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'publisher':
      return '/publisher/dashboard';
    case 'commenter':
      return '/commenter/hall';
    default:
      return '/publisher/dashboard'; // 默认返回派单员首页
  }
};

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

// 公开路由（不需要登录）
const publicRoutes = [
  '/auth/login/adminlogin',
  '/publisher/auth/login', // 修正派单员登录路径
  '/publisher/auth/register', // 添加派单员注册路径
  '/commenter/auth/login',
  '/commenter/auth/register',
  '/auth/register',
  '/auth/forgot-password',
  '/', // 首页
];

// 角色路由映射
const roleRoutes = {
  admin: ['/admin'],
  publisher: ['/publisher'],
  commenter: ['/commenter'],
};

export const AuthGuard = ({ children, requiredRole, allowedRoles }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useUser();

  useEffect(() => {
    // 如果还在加载中，不做任何处理
    if (isLoading) return;

    // 检查是否为公开路由
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || (route !== '/' && pathname?.startsWith(route))
    );

    // 如果用户未登录且不是公开路由，重定向到登录页
    if (!isAuthenticated && !isPublicRoute) {
      // 根据路径判断应该跳转到哪个登录页面
      if (pathname?.startsWith('/admin')) {
        router.push('/auth/login/adminlogin');
      } else if (pathname?.startsWith('/publisher')) {
        router.push('/publisher/auth/login'); // 修正为正确的派单员登录路径
      } else if (pathname?.startsWith('/commenter')) {
        router.push('/commenter/auth/login');
      } else {
        router.push('/publisher/auth/login'); // 默认跳转到派单员登录页
      }
      return;
    }

    // 如果用户已登录且在登录页，重定向到对应角色首页
    if (isAuthenticated && user && (
      pathname === '/auth/login/adminlogin' || 
      pathname === '/publisher/auth/login' || // 修正派单员登录路径
      pathname === '/commenter/auth/login'
    )) {
      const homePath = getRoleHomePath(user.role);
      router.push(homePath as any);
      return;
    }

    // 如果用户已登录，检查角色权限
    if (isAuthenticated && user && !isPublicRoute) {
      // 检查特定角色要求
      if (requiredRole && user.role !== requiredRole) {
        // 重定向到用户对应角色的首页
        const homePath = getRoleHomePath(user.role);
        router.push(homePath as any);
        return;
      }

      // 检查允许的角色列表
      if (allowedRoles && !allowedRoles.includes(user.role)) {
          const homePath = getRoleHomePath(user.role);
          router.push(homePath as any);
          return;
        }

      // 检查用户是否访问了正确的角色路由
      const userRoleRoutes = roleRoutes[user.role as keyof typeof roleRoutes] || [];
      const isValidRoleRoute = userRoleRoutes.some(route => pathname?.startsWith(route));
      
      // 如果访问的不是公开路由，也不是用户角色对应的路由，重定向
      if (!isValidRoleRoute && !isPublicRoute && (pathname || '') !== '/') {
          const homePath = getRoleHomePath(user.role);
          router.push(homePath as any);
          return;
        }
    }
  }, [isLoading, isAuthenticated, user, pathname, router, requiredRole, allowedRoles]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 返回子组件
  return <>{children}</>;
};

// 角色守卫 HOC
export const withRoleGuard = (Component: React.ComponentType, requiredRole: string) => {
  return function ProtectedComponent(props: any) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

// 多角色守卫 HOC
export const withMultiRoleGuard = (Component: React.ComponentType, allowedRoles: string[]) => {
  return function ProtectedComponent(props: any) {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};