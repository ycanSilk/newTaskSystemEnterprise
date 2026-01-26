'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname,useRouter, useSearchParams } from 'next/navigation';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import { UserOutlined, LeftOutlined, BellOutlined } from '@ant-design/icons';
import { decryptRoute, isEncryptedRoute, encryptRoute } from '../../../lib/routeEncryption';

interface User {
  id: string;
  username?: string;
  name?: string;
  role: string;
  balance: number;
  status?: string;
  createdAt?: string;
}

interface ClientHeaderProps {
  user?: User | null;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUserName, setShowUserName] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pageTitle, setPageTitle] = useState('账户租赁');
  const headerRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  // 创建下拉菜单的ref
  const dropdownRef = useRef<HTMLDivElement>(null);
  // 创建头像按钮的ref
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

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

  // 定义路由到标题的映射关系
  const routeTitleMap: Record<string, string> = {
    '/accountrental': '账户租赁',
    '/accountrental/account-rental-market': '出租市场',
    '/accountrental/account-rental-requests': '求租市场',
    '/accountrental/account-rental-publish': '发布租赁',
    '/accountrental/my-account-rental': '我的租赁',
    '/accountrental/account-rental-market/market-detail': '出租信息详情',
    '/accountrental/account-rental-requests/request-detail': '求租信息详情',
    '/accountrental/account-rental-requests/requests-detail': '求租信息详情',
    '/accountrental/account-rental-publish/publish-for-rent': '发布出租信息',
    '/accountrental/account-rental-publish/publish-requests': '发布求租信息',
    '/accountrental/my-account-rental/myrentalorder': '我出租的订单',
    '/accountrental/my-account-rental/myrentedorder': '我租用的订单',
    '/accountrental/my-account-rental/rentaloffer': '我发布的出租信息',
    '/accountrental/my-account-rental/rentalrequest': '我发布的求租信息',
    '/accountrental/my-account-rental/rentalrequest/rentalrequest-detail/[id]': '我发布的求租信息详情',
    '/accountrental/my-account-rental/rentaloffer/rentaloffer-detail/[id]': '我发布的出租信息详情',
    '/accountrental/my-account-rental/myrentalorder/myrentalorder-detail/[id]': '我出租的订单详情',
    '/accountrental/my-account-rental/myrentedorder/myrentedorder-detail/[id]': '我租用的订单详情'
  };

  // 定义账号租赁模块的一级页面（点击返回跳转到hall）
  const firstLevelPages = [
    '/accountrental/account-rental-market',
    '/accountrental/account-rental-requests',
    '/accountrental/account-rental-publish',
    '/accountrental/my-account-rental'
  ];

  // 定义需要特殊处理的一级页面下的URL模式
  const myAccountRentalPages = [
    '/accountrental/my-account-rental'
  ];

  // 处理返回按钮点击事件
  const handleBack = () => {
    if (!pathname) return;

    const decryptedPath = getDecryptedPath(pathname);
    const decryptedParts = decryptedPath.split('/').filter(Boolean);

    // 只有当URL精确匹配这4个路径时，才返回commenter/dashboard
    if (firstLevelPages.includes(decryptedPath)) {
      router.push(getEncryptedPath('/commenter/dashboard?tab=overview'));
      return;
    }

    // 定义动态路由到列表页面的映射关系
    const dynamicRouteMap: Record<string, string> = {
      '/accountrental/account-rental-market/market-detail': '/accountrental/account-rental-market',
      '/accountrental/account-rental-requests/requests-detail': '/accountrental/account-rental-requests',
      '/accountrental/my-account-rental/myrentalorder/myrentalorder-detail': '/accountrental/my-account-rental/myrentalorder',
      '/accountrental/my-account-rental/myrentedorder/myrentedorder-detail': '/accountrental/my-account-rental/myrentedorder',
      '/accountrental/my-account-rental/rentaloffer/rentaloffer-detail': '/accountrental/my-account-rental/rentaloffer',
      '/accountrental/my-account-rental/rentalrequest/rentalrequest-detail': '/accountrental/my-account-rental/rentalrequest',
    };

    // 检查当前路径是否匹配动态路由模式
    for (const [routePattern, targetPath] of Object.entries(dynamicRouteMap)) {
      if (decryptedPath.includes(routePattern)) {
        // 对于动态路由，返回到对应的列表页面
        router.push(getEncryptedPath(targetPath));
        return;
      }
    }

    // 提取上一级路由路径
    if (decryptedParts.length > 1) {
      const parentPath = '/' + decryptedParts.slice(0, -1).join('/');
      router.push(getEncryptedPath(parentPath));
    } else {
      router.push(getEncryptedPath('/commenter/dashboard?tab=overview'));
    }
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    if (!pathname) return false;
    const decryptedPath = getDecryptedPath(pathname);
    return decryptedPath.startsWith('/accountrental/') && decryptedPath !== '/accountrental';
  };

  useEffect(() => {
    setIsClient(true);
    
    // 在客户端计算页面标题
    if (pathname) {
      const decryptedPath = getDecryptedPath(pathname);
      
      // 尝试精确匹配
      if (routeTitleMap[decryptedPath]) {
        setPageTitle(routeTitleMap[decryptedPath]);
        return;
      }

      // 尝试匹配路径前缀（移除查询参数后的路径）
      const pathWithoutQuery = decryptedPath.split('?')[0];
      if (routeTitleMap[pathWithoutQuery]) {
        setPageTitle(routeTitleMap[pathWithoutQuery]);
        return;
      }

      // 优先匹配更长的路由模式，以避免匹配到更短的通用路径
      const sortedRoutes = Object.entries(routeTitleMap).sort(([a], [b]) => b.length - a.length);
      
      // 处理动态路由的特殊逻辑
      const pathParts = pathWithoutQuery.split('/').filter(Boolean);
      
      for (const [route, title] of sortedRoutes) {
        // 检查是否是动态路由模式（包含[ID]或类似参数）
        if (route.includes('[id]')) {
          // 创建动态路由的正则表达式模式
          // 将 [id] 替换为匹配任何非斜杠字符的模式 (\d+ 匹配数字ID)
          const dynamicRoutePattern = route.replace(/\[id\]/g, '(\\d+)');
          const regexPattern = new RegExp(`^${dynamicRoutePattern}$`);
          
          if (regexPattern.test(pathWithoutQuery)) {
            setPageTitle(title);
            return;
          }
        } else {
          // 对于非动态路由，检查路径是否以该路由开头或者包含该路由后跟斜杠或结尾
          const routePattern = new RegExp(`^${route}(/.*)?$`);
          if (pathWithoutQuery.includes(route) || routePattern.test(pathWithoutQuery)) {
            setPageTitle(title);
            return;
          }
        }
      }
      
      // 如果没有找到匹配项，尝试基于路径段进行匹配
      // 例如: /accountrental/my-account-rental/rentalrequest/rentalrequest-detail/1 应该匹配到 rentalrequest-detail
      if (pathParts.length >= 4) {
        // 对于详细页面，尝试匹配倒数第二个路径段
        const detailPathSegment = pathParts[pathParts.length - 2];
        for (const [route, title] of sortedRoutes) {
          if (route.includes(detailPathSegment)) {
            setPageTitle(routeTitleMap[route]);
            return;
          }
        }
      }
    }
  }, [pathname]);

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 检查点击是否发生在下拉菜单外部
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarButtonRef.current &&
        !avatarButtonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    // 添加全局点击事件监听器
    document.addEventListener('mousedown', handleClickOutside);

    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleDashboardClick = () => {  
    router.push(getEncryptedPath('/commenter/hall'));
  };

  const handleUserAvatarClick = () => {
    setShowUserName(!showUserName);
  };

  // 处理退出登录
  const handleLogout = () => {
    // 清除用户登录状态（实际项目中可能需要调用API或清除本地存储）
    // 重定向到登录页面
    router.push('/commenter/auth/login');
  };

  return (
    <div ref={headerRef} className="bg-blue-500 border-b border-[#9bcfffff] px-2 py-3 flex items-center justify-between h-[60px] box-border">
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
        <h1 className="text-xl text-white">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center relative">
        {isClient && (
          <CustomerServiceButton 
            buttonText="联系客服" 
            modalTitle="在线客服" 
            CustomerServiceId="admin"
            className="text-white mr-1 font-bold text-lg"
          />
        )}
        
        <div className="relative">
          <BellOutlined className="text-3xl text-white rounded-full p-1" />
          {/* 通知数量提示 */}
          <div className="absolute top-0 left-5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>


        {/* 用户头像和下拉菜单 */}
        <div className="relative ml-3 mr-3">
          <button 
            ref={avatarButtonRef}
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            aria-label="用户菜单"
          >
            <img 
              src="/images/default.png" 
              alt="用户头像" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div 
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-[100px] bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10 transform transition-all duration-200 origin-top-right animate-fade-in-down"
            >
              {/* 个人中心按钮 */}
              <button 
                onClick={() => {
                  router.push('/commenter/profile/userinfo');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 border-b border-gray-100 text-gray-800 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                个人信息
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
        <button
          onClick={handleDashboardClick}
          className="text-sm cursor-pointer text-xl text-white transition-all duration-300 ease mr-2"
        >
          返回
        </button>
      </div>
    </div>
  );
};

export default ClientHeader;