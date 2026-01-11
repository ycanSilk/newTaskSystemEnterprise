import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';

interface BackButtonProps {
  // 可选的自定义className
  className?: string;
  // 可选的自定义返回处理函数
  customBackHandler?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ className = '', customBackHandler }) => {
  const router = useRouter();
  const pathname = usePathname();

  // 定义各模块的首页路由
  const moduleHomepages: Record<string, string> = {
    '/publisher': '/publisher/dashboard',
    '/admin': '/admin/dashboard',
    '/commenter': '/commenter/hall',
    '/accountrental': '/accountrental/account-rental-market'
  };

  // 定义各模块的一级页面列表
  const firstLevelPages = [
    // 派单模块
    '/publisher/dashboard',
    '/publisher/create',
    '/publisher/stats',
    '/publisher/finance',
    '/publisher/profile',
    '/publisher/orders',
    '/publisher/transactions',
    '/publisher/tasks',
    '/publisher/balance',
    '/publisher/bank-cards',
    '/publisher/bind-bank-card',
    
    // 管理员模块
    '/admin/dashboard',
    '/admin/users',
    '/admin/tasks',
    '/admin/finance',
    '/admin/orders',
    '/admin/transactions',
    '/admin/reports',
    '/admin/settings',
    '/admin/system',
    
    // 抢单模块
    '/commenter/hall',
    '/commenter/tasks',
    '/commenter/earnings',
    '/commenter/profile',
    '/commenter/bank-cards',
    '/commenter/bind-bank-card',
    '/commenter/invite',
    '/commenter/lease',
    '/commenter/hall-content',
    
    // 账号租赁模块
    '/accountrental',
    '/accountrental/account-rental-market',
    '/accountrental/account-rental-requests',
    '/accountrental/account-rental-publish',
    '/accountrental/my-account-rental'
  ];

  const handleBack = () => {
    // 如果提供了自定义返回处理函数，则优先使用
    if (customBackHandler) {
      customBackHandler();
      return;
    }

    // 检查当前页面是否为一级页面
    if (firstLevelPages.includes(pathname ?? '')) {
      // 如果是一级页面，直接返回该模块的首页导航
      for (const [modulePrefix, homePage] of Object.entries(moduleHomepages)) {
        if (pathname?.startsWith(modulePrefix)) {
          router.push(homePage as any);
          return;
        }
      }
      // 默认返回网站首页
      router.push('/');
    } else {
      // 处理动态路由页面（带[id]的页面）
      const dynamicRoutes = [
        '/accountrental/account-rental-market/market-detail/[id]',
        '/accountrental/account-rental-requests/requests-detail/[id]',
        '/accountrental/my-account-rental/forrentorder/forrentorder-detail/[id]',
        '/accountrental/my-account-rental/rentalorder/rentalorder-detail/[id]',
        '/accountrental/my-account-rental/rentaloffer/rentaloffer-detail/[id]',
        '/accountrental/my-account-rental/rentalrequest/rentalrequest-detail/[id]',
        '/accountrental/my-account-rental/rented/rented-detail/[id]'
      ];

      // 检查当前路径是否匹配动态路由模式
      for (const dynamicRoute of dynamicRoutes) {
        const routePattern = dynamicRoute.replace('/[id]', '');
        if (pathname?.startsWith(routePattern)) {
          // 对于动态路由，返回到包含该动态路由的上级页面
          router.push(routePattern as any);
          return;
        }
      }

      // 不是一级页面和动态路由页面，提取上一级路由路径
      const pathParts = (pathname || '').split('/').filter(Boolean);
      if (pathParts.length > 0) {
        // 检查是否为多层级路径
        if (pathParts.length > 1) {
          // 对于账号租赁模块的特殊处理
          if (pathParts[0] === 'accountrental') {
            // 检查是否为accountrental的二级页面
            const secondLevelPath = '/' + pathParts.slice(0, 2).join('/');
            if (firstLevelPages.includes(secondLevelPath)) {
              router.push(secondLevelPath as any);
              return;
            }
          }
        }
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        // 使用类型断言解决 typedRoutes 的类型问题
        router.push(parentPath as any);
      } else {
        // 如果已经是根路径，则返回首页
        router.push('/');
      }
    }
  };

  // 检查是否为二级及更深层级的页面
  // 通过检查路径中"/"的数量来判断层级
  const isDeepPage = (pathname || '').split('/').length > 2;

  // 在首页不显示，在其他二级及更深层级页面显示
  const shouldShow = isDeepPage && (pathname || '') !== '/';

  if (!shouldShow) {
    return null;
  }

  return (
    <button 
      onClick={handleBack}
      className={`p-2 rounded-full transition-colors ${className}`}
      aria-label="返回上一页"
    >
      <LeftOutlined size={20} className="text-white" />
    </button>
  );
};