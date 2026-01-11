'use client';

// 导入React的useEffect钩子和ReactNode类型
// useEffect用于处理副作用，ReactNode用于定义子组件类型
import { useEffect, ReactNode } from 'react';
// 导入Next.js的导航钩子
// useRouter用于页面跳转，usePathname用于获取当前路径
import { useRouter, usePathname } from 'next/navigation';
// 导入useUser钩子，用于获取用户登录状态和信息
import { useUser } from '@/hooks/useUser';
// 导入Loading组件，用于显示加载状态
import { Loading } from '@/components/ui';
// 导入路由加密和解密工具函数
import { isEncryptedRoute, decryptRoute } from '@/lib/routeEncryption';

// 定义根据角色获取首页路径的函数
// 替代已删除的auth模块的内联实现
const getRoleHomePath = (role: string) => {
  // 根据角色返回对应的首页路径
  switch (role) {
    case 'publisher':
      return '/publisher/dashboard'; // 派单员首页
    default:
      return '/publisher/dashboard'; // 默认返回派单员首页
  }
};

// 定义AuthGuard组件的属性类型
interface AuthGuardProps {
  children: ReactNode; // 子组件，即需要保护的页面内容
  requiredRole?: string; // 可选，要求的特定角色
  allowedRoles?: string[]; // 可选，允许的角色列表
}

// 定义公开路由列表（不需要登录即可访问的页面）
const publicRoutes = [
  '/publisher/auth/login', // 派单员登录页面
  '/publisher/auth/register', // 派单员注册页面
];

// 定义角色路由映射，用于限制不同角色可以访问的路由
const roleRoutes = {
  publisher: ['/publisher'], // 派单员可以访问/publisher开头的所有路由
};

// 导出AuthGuard组件，用于保护需要登录的页面
// 这个组件是前端路由守卫，用于验证用户登录状态和角色权限
export const AuthGuard = ({ children, requiredRole, allowedRoles }: AuthGuardProps) => {
  // 获取路由对象，用于页面跳转
  const router = useRouter();
  // 获取当前路径，用于判断当前页面是否需要登录
  const pathname = usePathname();
  // 从useUser钩子获取用户信息和登录状态
  const { user, isLoading, isAuthenticated } = useUser();

  // 检查是否为公开路由
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname?.startsWith(route))
  );

  // 使用useEffect监听相关状态变化，处理路由守卫逻辑
  useEffect(() => {
    console.log('AuthGuard useEffect: 开始执行路由守卫逻辑');
    console.log('AuthGuard useEffect: 当前状态 - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    console.log('AuthGuard useEffect: 当前路径 - pathname:', pathname);
    
    // 如果还在加载中，不做任何处理
    if (isLoading) {
      console.log('AuthGuard useEffect: 加载中，跳过路由守卫');
      return;
    }

    // 检查当前路径是否为公开路由
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || (route !== '/' && pathname?.startsWith(route))
    );
    console.log('AuthGuard useEffect: isPublicRoute:', isPublicRoute);

    // 如果用户已登录且在登录页，重定向到对应角色的首页
    if (isAuthenticated && user && (
      pathname === '/publisher/auth/login' // 派单员登录页面
    )) {
      console.log('AuthGuard useEffect: 用户已登录且在登录页，准备重定向到首页');
      // 获取用户角色对应的首页路径
      const homePath = getRoleHomePath(user.role);
      console.log('AuthGuard useEffect: 重定向到首页 -', homePath);
      // 跳转到首页
      router.push(homePath as any);
      return;
    }

    // 如果用户已登录，检查角色权限
    if (isAuthenticated && user && !isPublicRoute) {
      console.log('AuthGuard useEffect: 用户已登录，检查角色权限');
      // 检查是否有特定角色要求
      if (requiredRole && user.role !== requiredRole) {
        console.log('AuthGuard useEffect: 角色不匹配，准备重定向到首页');
        // 如果用户角色不符合要求，重定向到其角色对应的首页
        const homePath = getRoleHomePath(user.role);
        console.log('AuthGuard useEffect: 重定向到首页 -', homePath);
        router.push(homePath as any);
        return;
      }

      // 检查是否有允许的角色列表
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log('AuthGuard useEffect: 角色不在允许列表中，准备重定向到首页');
        // 如果用户角色不在允许列表中，重定向到其角色对应的首页
        const homePath = getRoleHomePath(user.role);
        console.log('AuthGuard useEffect: 重定向到首页 -', homePath);
        router.push(homePath as any);
        return;
      }

      // 检查用户是否访问了正确的角色路由
      // 获取用户角色对应的路由列表
      const userRoleRoutes = roleRoutes[user.role as keyof typeof roleRoutes] || [];
      console.log('AuthGuard useEffect: userRoleRoutes:', userRoleRoutes);
      
      // 处理加密路由
      let checkPath = pathname;
      if (pathname) {
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length > 0 && isEncryptedRoute(pathParts[0])) {
          // 如果是加密路由，使用decryptRoute函数解密
          console.log('AuthGuard useEffect: 检测到加密路由，开始解密');
          try {
            // 解密第一级路径
            const decryptedFirstLevel = decryptRoute(pathParts[0]);
            console.log('AuthGuard useEffect: 解密后第一级路径 -', decryptedFirstLevel);
            
            // 构建完整的解密路径
            const remainingPath = pathParts.slice(1).join('/');
            checkPath = `${decryptedFirstLevel}${remainingPath ? `/${remainingPath}` : ''}`;
            console.log('AuthGuard useEffect: 完整解密路径 -', checkPath);
          } catch (error) {
            console.error('AuthGuard useEffect: 解密路由失败 -', error);
          }
        }
      }
      
      // 检查当前路径是否符合角色路由要求
      let isValidRoleRoute = false;
      
      // 检查解密后的路径是否以用户角色允许的路由开头
      isValidRoleRoute = userRoleRoutes.some(route => {
        return checkPath?.startsWith(route);
      });
      
      console.log('AuthGuard useEffect: 原始路径 -', pathname);
      console.log('AuthGuard useEffect: 检查路径 -', checkPath);
      console.log('AuthGuard useEffect: isValidRoleRoute:', isValidRoleRoute);
      
      // 如果访问的不是公开路由，也不是用户角色对应的路由，重定向到首页
      if (!isValidRoleRoute && !isPublicRoute && (pathname || '') !== '/') {
        console.log('AuthGuard useEffect: 路由不在允许列表中，准备重定向到首页');
        const homePath = getRoleHomePath(user.role);
        console.log('AuthGuard useEffect: 重定向到首页 -', homePath);
        router.push(homePath as any);
        return;
      }
      
      console.log('AuthGuard useEffect: 路由守卫检查通过，允许访问当前页面');
    }
    
    console.log('AuthGuard useEffect: 路由守卫逻辑执行完毕');
  }, [isLoading, isAuthenticated, user, pathname, router, requiredRole, allowedRoles]);

  // 1. 加载状态：显示加载动画
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

  // 2. 公开路由或已登录状态：显示子组件（即受保护的页面内容）
  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>;
  }

  // 3. 未登录且非公开路由：显示登录提示弹窗
  return (
    // 全屏遮罩层，阻止用户操作页面其他内容
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      {/* 全屏绝对定位的div，用于覆盖整个页面，阻止用户点击其他元素 */}
      <div className="absolute inset-0" />
      
      {/* 登录提示弹窗 */}
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 z-10">
        {/* 弹窗标题 */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">请先登录</h3>
        
        {/* 弹窗提示信息 */}
        <p className="text-gray-600 mb-8 text-center">
          您尚未登录，无法访问该页面。请先登录账号。
        </p>
        
        {/* 立即登录按钮 - 只有一个登录页面 */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              // 所有未登录用户都跳转到同一个登录页面
              router.push('/publisher/auth/login');
            }}
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