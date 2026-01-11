'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import { BellOutlined } from '@ant-design/icons';
import { 
  routeTitleMap,
  routeHierarchyMap, 
  firstLevelPages
} from '../config/routes';
import { decryptRoute, isEncryptedRoute, encryptRoute } from '../../../lib/routeEncryption';

interface PublisherHeaderProps {
  user?: {
    id: string;
    username?: string;
    name?: string;
    role: string;
    balance: number;
    status?: string;
    createdAt?: string;
  };
}

export const PublisherHeader: React.FC<PublisherHeaderProps> = ({ user = null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserName, setShowUserName] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pageTitle, setPageTitle] = useState('发布者中心');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 获取解密后的路径
  const getDecryptedPath = (path: string) => {
    if (!path) return path;
    
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 0 && isEncryptedRoute(pathParts[0])) {
      try {
        return decryptRoute(pathParts[0]);
      } catch (error) {
        console.error('Failed to decrypt route:', error);
        return path;
      }
    }
    return path;
  };
  
  // 获取加密后的路径
  const getEncryptedPath = (path: string) => {
    if (!path) return path;
    
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const firstTwoLevels = `/${pathParts[0]}/${pathParts[1]}`;
      const encrypted = encryptRoute(firstTwoLevels);
      const remainingPath = pathParts.slice(2).join('/');
      return `/${encrypted}${remainingPath ? `/${remainingPath}` : ''}`;
    }
    return path;
  };

  // 直接使用路由标题映射

  // 处理返回按钮点击事件
  const handleBack = () => {
    if (!pathname) return;

    // 获取不包含查询参数的路径
    const pathWithoutQuery = pathname.split('?')[0];
    
    // 解密路径以进行判断
    const decryptedPath = getDecryptedPath(pathWithoutQuery);
    const decryptedParts = decryptedPath.split('/').filter(Boolean);
    
    // 检查当前页面是否为一级页面
    if (firstLevelPages.includes(decryptedPath)) {
      // 如果是一级页面，返回发布者主页
      router.push(getEncryptedPath('/publisher/dashboard'));
      return;
    }

    // 检查是否有明确的层级映射（精确匹配）
    if (routeHierarchyMap[decryptedPath]) {
      router.push(getEncryptedPath(routeHierarchyMap[decryptedPath]));
      return;
    }

    // 处理动态路由（包含ID或特定格式的路径）
    const pathParts = pathWithoutQuery.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // 检查是否有以当前路径前缀开头的动态路由映射
      // 构建可能的父级路径模式，处理带参数的动态路由
      for (let i = pathParts.length; i >= 2; i--) {
        const basePath = '/' + pathParts.slice(0, i).join('/');
        // 检查是否为动态路由（包含参数部分）
        const hasDynamicParam = pathParts.length > i && !isNaN(Number(pathParts[i]));
        if (hasDynamicParam) {
          // 对于带参数的路由，尝试匹配基础路径
          const parentPath = basePath;
          if (routeHierarchyMap[parentPath]) {
            router.push(routeHierarchyMap[parentPath]);
            return;
          }
        }
      }

      // 检查是否存在部分匹配的路由层级映射（基于目录结构）
      // 从最长路径开始尝试匹配
      for (let i = pathParts.length; i >= 2; i--) {
        const partialPath = '/' + pathParts.slice(0, i).join('/');
        if (routeHierarchyMap[partialPath]) {
          router.push(routeHierarchyMap[partialPath]);
          return;
        }
      }

      // 通用的层级返回逻辑
      if (pathParts.length > 2) {
        // 对于创建任务相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'create') {
          // 检查是否为平台类型选择页面
          if (pathParts.length >= 3 && pathParts[2] === 'platformtype') {
            router.push('/publisher/dashboard');
            return;
          }
          // 检查是否为平台任务页面
          if (pathParts.length >= 4 && pathParts[2] === 'platform-task') {
            router.push('/publisher/create/platformtype');
            return;
          }
          // 其他创建任务的子页面返回平台任务选择页面
          router.push('/publisher/create/platform-task/douyin');
          return;
        }

        // 对于Dashboard相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'dashboard') {
          router.push('/publisher/dashboard');
          return;
        }

        // 对于个人资料相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'profile') {
          router.push('/publisher/profile');
          return;
        }

        // 对于订单相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'orders') {
          router.push('/publisher/orders');
          return;
        }

        // 对于余额相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'balance') {
          // 检查是否为余额主页面
          if (pathParts.length === 2) {
            router.push('/publisher/profile');
          } else {
            router.push('/publisher/balance');
          }
          return;
        }
      }

      // 标准的上一级路径返回
      if (pathParts.length > 1) {
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        router.push(parentPath);
      } else {
        // 如果只有一级路径，则返回发布者主页
        router.push('/publisher/dashboard');
      }
    } else {
      // 如果已经是根路径，则返回首页
      router.push('/');
    }
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    if (!pathname) return false;
    // 解密路径以进行判断
    const decryptedPath = getDecryptedPath(pathname);
    // 在首页不显示，在其他页面显示
    return decryptedPath !== '/publisher/dashboard' && decryptedPath !== '/publisher';
  };

  useEffect(() => {
    setIsClient(true);
    
    // 在客户端计算页面标题
    if (pathname) {
      // 解密路径以进行标题匹配
      const decryptedPath = getDecryptedPath(pathname);
      const pathWithoutQuery = pathname.split('?')[0];
      const decryptedPathWithoutQuery = decryptedPath.split('?')[0];
      
      // 1. 首先尝试完整路径匹配（包含查询参数）
      const titleWithQuery = routeTitleMap[pathname] || routeTitleMap[decryptedPath];
      if (titleWithQuery) {
        setPageTitle(titleWithQuery as string);
        return;
      }
      
      // 2. 尝试精确匹配（不包含查询参数）
      const titleExact = routeTitleMap[pathWithoutQuery] || routeTitleMap[decryptedPathWithoutQuery];
      if (titleExact) {
        setPageTitle(titleExact as string);
        return;
      }
      
      // 3. 优先匹配更长的路由模式，以避免匹配到更短的通用路径
      const sortedRoutes = Object.entries(routeTitleMap).sort(([a], [b]) => b.length - a.length);
      
      // 处理动态路由的特殊逻辑
      const pathParts = pathWithoutQuery.split('/').filter(Boolean);
      
      // 4. 处理带ID参数的动态路由
      for (const [route, title] of sortedRoutes) {
        // 检查是否是动态路由模式（包含[ID]或类似参数）
        if (route.includes('[id]')) {
          // 创建动态路由的正则表达式模式，支持数字和字符串ID
          const dynamicRoutePattern = route
            .replace(/\[id\]/g, '([\\w-]+)')
            .replace(/\//g, '\\/');
          const regexPattern = new RegExp(`^${dynamicRoutePattern}$`);
          
          if (regexPattern.test(pathWithoutQuery) || regexPattern.test(decryptedPath)) {
            setPageTitle(title as string);
            return;
          }
        }
      }
      
      // 5. 尝试前缀匹配（包含子路径的情况）
      for (const [route, title] of sortedRoutes) {
        // 对于非动态路由，检查路径是否以该路由开头
        if (pathWithoutQuery.startsWith(route + '/') || decryptedPath.startsWith(route + '/')) {
          setPageTitle(title as string);
          return;
        }
        // 检查路径是否完全包含该路由
        if (pathWithoutQuery.includes(route + '/') || decryptedPath.includes(route + '/')) {
          setPageTitle(title as string);
          return;
        }
      }
      
      // 6. 尝试基于路径段进行部分匹配
      if (pathParts.length >= 3) {
        // 构建可能的父级路径段组合
        for (let i = pathParts.length; i >= 2; i--) {
          const partialPath = '/' + pathParts.slice(0, i).join('/');
          const titlePartial = routeTitleMap[partialPath];
          if (titlePartial) {
            setPageTitle(titlePartial as string);
            return;
          }
        }
        
        // 尝试匹配倒数第二个路径段（对于详情页面）
        if (pathParts.length >= 4) {
          const secondLastSegment = pathParts[pathParts.length - 2];
          for (const [route, title] of sortedRoutes) {
            if (route.includes(secondLastSegment)) {
              setPageTitle(title);
              return;
            }
          }
        }
      }
      
      // 7. 如果所有匹配都失败，根据主要目录设置默认标题
      const decryptedParts = decryptedPath.split('/').filter(Boolean);
      if (decryptedParts.length >= 2) {
        const mainCategory = decryptedParts[1];
        switch (mainCategory) {
          case 'create':
            setPageTitle('发布任务');
            break;
          case 'dashboard':
            setPageTitle('评论订单');
            break;
          case 'profile':
            setPageTitle('我的');
            break;
          case 'orders':
            setPageTitle('订单管理');
            break;
          case 'balance':
            setPageTitle('余额');
            break;
          case 'recharge':
            setPageTitle('充值');
            break;
          case 'finance':
            setPageTitle('充值');
            break;
          case 'transactions':
            setPageTitle('充值记录');
            break;
          case 'bank-cards':
            setPageTitle('银行卡管理');
            break;
          case 'notification':
            setPageTitle('通知提醒');
            break;
          case 'stats':
            setPageTitle('统计报表');
            break;
          default:
            setPageTitle('发布者中心');
        }
      } else {
        setPageTitle('发布者中心');
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    console.log('Logging out user');
    try {
      // 在实际应用中，这里会调用认证相关的方法来清除登录状态
      // PublisherAuthStorage.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/publisher/auth/login');
    }
  };

  const handleUserAvatarClick = () => {
    setShowUserName(!showUserName);
  };

  const handleProfileClick = () => {
    setShowUserName(false); // 关闭下拉菜单
    router.push(getEncryptedPath('/publisher/profile/settings'));
  };

  const handleLogoutClick = async () => {
    setShowUserName(false); // 关闭下拉菜单
    console.log('Logging out user');
    try {
      // 在实际应用中，这里会调用认证相关的方法来清除登录状态
      // PublisherAuthStorage.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/auth/login/publisherlogin');
    }
  };

  // 点击页面其他区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // 检查点击是否发生在头像按钮或下拉菜单之外
      if (showUserName && !target.closest('.user-avatar-container')) {
        setShowUserName(false);
      }
    };

    if (showUserName) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserName]);

  return (
    <div className="bg-blue-500 border-b border-[#9bcfffff] px-4 py-3 flex items-center justify-between h-[60px] box-border">
      <div className="flex items-center flex-1">
        {isClient && shouldShowBackButton() && (
          <button 
            onClick={handleBack}
            className="p-2 rounded-full transition-colors text-white"
            aria-label="返回上一页"
          >
            <LeftOutlined size={20} className="text-white" />
          </button>
        )}
        <h1 className="text-xl text-white ml-1">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center relative">
        {isClient && (
          <CustomerServiceButton 
            buttonText="联系客服" 
            modalTitle="在线客服" 
            CustomerServiceId={'admin'} 
            className="text-white font-bold mr-2 flex items-center gap-1 px-3 py-1 rounded"
          />
        )}
        
        <div className="mr-2 relative">
          <BellOutlined className="text-3xl text-white rounded-full p-1" />
          {/* 通知数量提示 */}
          <div className="absolute top-0 left-5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>

        {/* 用户头像和下拉菜单 */}
        <div className="relative ml-3">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            aria-label="用户菜单"
          >
            <img 
              src="/images/0e92a4599d02a7.jpg" 
              alt="用户头像" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10 transform transition-all duration-200 origin-top-right animate-fade-in-down">
              {/* 个人中心按钮 */}
              <button 
                onClick={() => {
                  router.push(getEncryptedPath('/publisher/profile/settings'));
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 border-b border-gray-100 text-gray-800 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                个人中心
              </button>
              
              {/* 退出登录按钮 */}
              <button 
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-sm"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};