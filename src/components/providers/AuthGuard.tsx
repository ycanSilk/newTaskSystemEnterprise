'use client';

// 导入React的useEffect钩子和ReactNode类型
import { useEffect, ReactNode } from 'react';
// 导入Next.js的导航钩子
import { useRouter, usePathname } from 'next/navigation';
// 导入useUser钩子，用于获取用户登录状态和信息
import { useUser } from '@/hooks/useUser';
// 导入Loading组件，用于显示加载状态
import { Loading } from '@/components/ui';

// 定义根据角色获取首页路径的函数
const getRoleHomePath = (role: string) => {
  switch (role) {
    case 'publisher':
      return '/publisher/dashboard';
    default:
      return '/publisher/dashboard';
  }
};

// 定义AuthGuard组件的属性类型
interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

// 定义公开路由列表（不需要登录即可访问的页面）
const publicRoutes = [
  '/publisher/auth/login',
  '/publisher/auth/register',
];

// 检查是否为公开路由
const isPublicRoute = (path: string | undefined): boolean => {
  if (!path) return false;
  return publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
};

// 导出AuthGuard组件，用于保护需要登录的页面
export const AuthGuard = ({ children, requiredRole, allowedRoles }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, refreshToken } = useUser();

  // 检查当前路径是否为公开路由
  const currentIsPublicRoute = isPublicRoute(pathname);

  // 使用useEffect监听相关状态变化，处理路由守卫逻辑
  useEffect(() => {
    // 如果还在加载中，不做任何处理
    if (isLoading) return;

    // 如果用户已登录且在登录页，重定向到对应角色的首页
    if (isAuthenticated && user && pathname === '/publisher/auth/login') {
      const homePath = getRoleHomePath(user.role);
      router.push(homePath as any);
      return;
    }

    // 如果用户已登录，检查角色权限
    if (isAuthenticated && user && !currentIsPublicRoute) {
      // 检查是否有特定角色要求
      if (requiredRole && user.role !== requiredRole) {
        const homePath = getRoleHomePath(user.role);
        router.push(homePath as any);
        return;
      }

      // 检查是否有允许的角色列表
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        const homePath = getRoleHomePath(user.role);
        router.push(homePath as any);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router, requiredRole, allowedRoles]);

  // 添加1小时定时轮询，检查token有效性
  useEffect(() => {
    if (!isAuthenticated) return;

    // 定时轮询函数
    const checkTokenValidity = async () => {
      try {
        // 调用refreshToken方法检查token有效性
        if (refreshToken) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Token检查失败:', error);
        // Token无效时，跳转到登录页
        router.push('/publisher/auth/login');
      }
    };

    // 初始检查
    checkTokenValidity();

    // 设置1小时轮询
    const pollingInterval = setInterval(checkTokenValidity, 60 * 60 * 1000);

    // 清理函数
    return () => clearInterval(pollingInterval);
  }, [isAuthenticated, refreshToken, router]);

  // 1. 加载状态：显示子组件（实现无感校验）
  if (isLoading) {
    return <>{children}</>;
  }

  // 2. 公开路由或已登录状态：显示子组件
  if (currentIsPublicRoute || isAuthenticated) {
    return <>{children}</>;
  }

  // 3. 未登录且非公开路由：显示登录提示弹窗
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="absolute inset-0" />
      
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 z-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">请先登录</h3>
        
        <p className="text-gray-600 mb-8 text-center">
          您尚未登录，无法访问该页面。请先登录账号。
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/publisher/auth/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>
  );
};

// 导出角色守卫HOC（高阶组件），用于保护需要特定角色的页面
// 这个函数接收一个组件和一个角色，返回一个受保护的组件
// 受保护的组件只有当用户具有指定角色时才能访问
export const withRoleGuard = (Component: React.ComponentType, requiredRole: string) => {
  return function ProtectedComponent(props: any) {
    return (
      // 使用AuthGuard组件包装原组件，并指定requiredRole
      <AuthGuard requiredRole={requiredRole}>
        {/* 传递所有属性给原组件 */}
        <Component {...props} />
      </AuthGuard>
    );
  };
};

// 导出多角色守卫HOC，用于保护需要多个角色的页面
// 这个函数接收一个组件和一个角色数组，返回一个受保护的组件
// 受保护的组件只有当用户具有数组中的任意一个角色时才能访问
export const withMultiRoleGuard = (Component: React.ComponentType, allowedRoles: string[]) => {
  return function ProtectedComponent(props: any) {
    return (
      // 使用AuthGuard组件包装原组件，并指定allowedRoles
      <AuthGuard allowedRoles={allowedRoles}>
        {/* 传递所有属性给原组件 */}
        <Component {...props} />
      </AuthGuard>
    );
  };
};